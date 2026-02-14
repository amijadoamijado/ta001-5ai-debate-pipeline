/**
 * 多層完了検知アルゴリズム
 *
 * 3層構成:
 *   第1層: CDPネットワーク傍受（SSE/WebSocketストリーム終了検知）
 *   第2層: MutationObserver（DOM変更監視、ストリーミングクラス消滅検知）
 *   第3層: コンテンツ安定化検知（テキスト長安定化）
 *
 * 適応的ポーリング間隔設計付き。
 */

import type { Page, CDPSession } from 'playwright';
import type {
  CompletionDetectionConfig,
  CompletionLayer,
  GenerationState,
  AIServiceName,
} from '../types';
import { createServiceLogger } from './logger';

const detectorLogger = createServiceLogger('completion-detector');

/** 完了検知の結果 */
interface CompletionResult {
  completed: boolean;
  layer_used: CompletionLayer;
  content?: string;
  duration_ms: number;
  error?: string;
}

/**
 * 多層完了検知を実行。設定の layers 順に試行する。
 */
export async function waitForCompletion(
  page: Page,
  config: CompletionDetectionConfig,
  serviceName: AIServiceName,
  maxTimeout: number
): Promise<CompletionResult> {
  const startTime = Date.now();

  // 全層を並列で起動し、最初に完了した層の結果を採用
  const promises: Promise<CompletionResult>[] = [];

  for (const layer of config.layers) {
    switch (layer) {
      case 'network':
        if (config.network) {
          promises.push(
            detectViaNetwork(page, config, serviceName, maxTimeout)
              .catch((err) => createErrorResult(layer, err, startTime))
          );
        }
        break;
      case 'mutation_observer':
        if (config.mutation_observer) {
          promises.push(
            detectViaMutationObserver(page, config, serviceName, maxTimeout)
              .catch((err) => createErrorResult(layer, err, startTime))
          );
        }
        break;
      case 'stabilization':
        if (config.stabilization) {
          promises.push(
            detectViaStabilization(page, config, serviceName, maxTimeout)
              .catch((err) => createErrorResult(layer, err, startTime))
          );
        }
        break;
    }
  }

  if (promises.length === 0) {
    throw new Error('No completion detection layers configured');
  }

  // Race: 最初に成功した検知層を採用
  const result = await Promise.race(promises);

  detectorLogger.info(
    `Completion detected via ${result.layer_used} layer in ${result.duration_ms}ms`,
    { service: serviceName, layer: result.layer_used, duration_ms: result.duration_ms }
  );

  return result;
}

/**
 * 第1層: CDPネットワーク傍受
 *
 * Fetch.enable でSSE/WebSocketストリームを監視。
 * ストリームのEOFを検知して完了と判定。
 */
async function detectViaNetwork(
  page: Page,
  config: CompletionDetectionConfig,
  serviceName: AIServiceName,
  maxTimeout: number
): Promise<CompletionResult> {
  const startTime = Date.now();
  const networkConfig = config.network;
  if (!networkConfig) {
    throw new Error('Network config not provided');
  }

  detectorLogger.debug(`Starting network detection for ${serviceName}`, {
    urlPattern: networkConfig.url_pattern,
  });

  let cdpSession: CDPSession | undefined;

  try {
    cdpSession = await page.context().newCDPSession(page);

    await cdpSession.send('Fetch.enable', {
      patterns: [
        {
          urlPattern: networkConfig.url_pattern,
          requestStage: 'Response',
        },
      ],
    });

    return await new Promise<CompletionResult>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Network detection timeout after ${maxTimeout}ms`));
      }, maxTimeout);

      cdpSession!.on('Fetch.requestPaused', async (params) => {
        try {
          const responseHeaders: Array<{ name: string; value: string }> =
            (params as Record<string, unknown>).responseHeaders as Array<{ name: string; value: string }> ?? [];
          const requestId = (params as Record<string, unknown>).requestId as string;

          const isTargetStream = responseHeaders.some(
            (h) =>
              h.name.toLowerCase() === 'content-type' &&
              h.value.includes(networkConfig.content_type)
          );

          if (isTargetStream) {
            detectorLogger.debug('Target stream detected, reading response body');

            const streamResult = await cdpSession!.send('Fetch.takeResponseBodyAsStream', {
              requestId,
            });

            const streamHandle = (streamResult as Record<string, string>).stream;
            let fullResponse = '';
            let eof = false;

            while (!eof) {
              const chunk = await cdpSession!.send('IO.read', {
                handle: streamHandle,
                size: 65536,
              });
              const chunkData = chunk as Record<string, unknown>;
              const data = chunkData.base64Encoded
                ? Buffer.from(chunkData.data as string, 'base64').toString()
                : (chunkData.data as string);
              fullResponse += data;
              eof = chunkData.eof as boolean;
            }

            // EOFマーカーチェック
            const eofMarker = networkConfig.eof_marker;
            if (!eofMarker || fullResponse.includes(eofMarker)) {
              clearTimeout(timeout);
              resolve({
                completed: true,
                layer_used: 'network',
                content: fullResponse,
                duration_ms: Date.now() - startTime,
              });
              return;
            }
          }

          // リクエストを続行
          await cdpSession!.send('Fetch.continueRequest', { requestId });
        } catch (err) {
          detectorLogger.warn(`Error processing network event: ${(err as Error).message}`);
          const requestId = (params as Record<string, unknown>).requestId as string;
          try {
            await cdpSession!.send('Fetch.continueRequest', { requestId });
          } catch {
            // ignore cleanup errors
          }
        }
      });
    });
  } finally {
    if (cdpSession) {
      try {
        await cdpSession.send('Fetch.disable');
        await cdpSession.detach();
      } catch {
        // ignore cleanup errors
      }
    }
  }
}

/**
 * 第2層: MutationObserver
 *
 * ページ内にMutationObserverを注入し、ストリーミングクラスの消滅と
 * アクションボタン（コピー、再生成）の出現を検知。
 */
async function detectViaMutationObserver(
  page: Page,
  config: CompletionDetectionConfig,
  serviceName: AIServiceName,
  maxTimeout: number
): Promise<CompletionResult> {
  const startTime = Date.now();
  const moConfig = config.mutation_observer;
  if (!moConfig) {
    throw new Error('MutationObserver config not provided');
  }

  detectorLogger.debug(`Starting MutationObserver detection for ${serviceName}`);

  // 適応的ポーリング設定
  const polling = config.adaptive_polling ?? {
    initial_interval_ms: 2000,
    multiplier: 1.5,
    max_interval_ms: 15000,
  };

  let interval = polling.initial_interval_ms;

  return new Promise<CompletionResult>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`MutationObserver detection timeout after ${maxTimeout}ms`));
    }, maxTimeout);

    const check = async (): Promise<void> => {
      if (Date.now() - startTime >= maxTimeout) {
        clearTimeout(timeout);
        reject(new Error('MutationObserver timeout'));
        return;
      }

      try {
        const state = await detectGenerationState(page, moConfig, config);

        if (state === 'completed') {
          clearTimeout(timeout);
          resolve({
            completed: true,
            layer_used: 'mutation_observer',
            duration_ms: Date.now() - startTime,
          });
          return;
        }

        if (state === 'error') {
          clearTimeout(timeout);
          reject(new Error('Error state detected during generation'));
          return;
        }

        // 適応的ポーリング: 間隔を徐々に増加
        interval = Math.min(interval * polling.multiplier, polling.max_interval_ms);
        setTimeout(check, interval);
      } catch (err) {
        // ページナビゲーション等で一時的にDOM操作が失敗する場合がある
        detectorLogger.debug(`MutationObserver check error: ${(err as Error).message}`);
        setTimeout(check, interval);
      }
    };

    // 初回は少し待ってから開始（ストリーミング開始までの猶予）
    setTimeout(check, polling.initial_interval_ms);
  });
}

/**
 * 第3層: コンテンツ安定化検知
 *
 * テキスト長が一定時間変化しなくなったら完了と判定。
 * 最終手段のセーフティネット。
 */
async function detectViaStabilization(
  page: Page,
  config: CompletionDetectionConfig,
  serviceName: AIServiceName,
  maxTimeout: number
): Promise<CompletionResult> {
  const startTime = Date.now();
  const stabConfig = config.stabilization;
  if (!stabConfig) {
    throw new Error('Stabilization config not provided');
  }

  detectorLogger.debug(`Starting stabilization detection for ${serviceName}`, {
    threshold: stabConfig.stability_threshold_ms,
  });

  const effectiveTimeout = Math.min(maxTimeout, stabConfig.max_timeout_ms);
  let lastContent = '';
  let lastChangeTime = Date.now();

  // 適応的ポーリング
  const polling = config.adaptive_polling ?? {
    initial_interval_ms: 2000,
    multiplier: 1.5,
    max_interval_ms: 15000,
  };
  let pollInterval = polling.initial_interval_ms;

  while (Date.now() - startTime < effectiveTimeout) {
    try {
      const currentContent = await page
        .locator(stabConfig.selector)
        .textContent({ timeout: 5000 });

      const content = currentContent ?? '';

      if (content !== lastContent) {
        lastContent = content;
        lastChangeTime = Date.now();
        // コンテンツ変化中は短い間隔に戻す
        pollInterval = polling.initial_interval_ms;
      } else if (
        content.length > 0 &&
        Date.now() - lastChangeTime >= stabConfig.stability_threshold_ms
      ) {
        return {
          completed: true,
          layer_used: 'stabilization',
          content: lastContent,
          duration_ms: Date.now() - startTime,
        };
      }
    } catch {
      // セレクタが見つからない場合はまだ生成が始まっていない
      detectorLogger.debug('Stabilization: target element not found yet');
    }

    await new Promise((r) => setTimeout(r, pollInterval));
    pollInterval = Math.min(pollInterval * polling.multiplier, polling.max_interval_ms);
  }

  throw new Error(`Stabilization detection timeout after ${effectiveTimeout}ms`);
}

/**
 * 3状態判別ロジック
 *
 * 各ポーリングサイクルで現在の状態を判定。
 */
async function detectGenerationState(
  page: Page,
  moConfig: NonNullable<CompletionDetectionConfig['mutation_observer']>,
  _fullConfig: CompletionDetectionConfig
): Promise<GenerationState> {
  // 完了チェック: アクションボタンの出現
  for (const buttonSelector of moConfig.action_buttons) {
    try {
      const visible = await page.locator(buttonSelector).first().isVisible();
      if (visible) return 'completed';
    } catch {
      continue;
    }
  }

  // 完了チェック: 完了インジケータの確認
  for (const indicator of moConfig.completion_indicators) {
    try {
      // ":not(:visible)" パターンをチェック
      if (indicator.includes(':not(:visible)')) {
        const baseSelector = indicator.replace(':not(:visible)', '');
        const count = await page.locator(baseSelector).count();
        if (count === 0) {
          // ストリーミング要素が消滅 = 完了の可能性
          // ただし、まだ生成開始前の可能性もあるので他の指標と合わせて判定
          continue;
        }
        const visible = await page.locator(baseSelector).first().isVisible();
        if (!visible) return 'completed';
      } else {
        const visible = await page.locator(indicator).first().isVisible();
        if (visible) return 'completed';
      }
    } catch {
      continue;
    }
  }

  // ストリーミング中チェック
  if (moConfig.streaming_class) {
    try {
      const streamingVisible = await page
        .locator(`.${moConfig.streaming_class}`)
        .first()
        .isVisible();
      if (streamingVisible) return 'generating';
    } catch {
      // ストリーミング要素が見つからない場合は無視
    }
  }

  return 'generating';
}

/** エラー結果を生成するヘルパー */
function createErrorResult(
  layer: CompletionLayer,
  error: unknown,
  startTime: number
): CompletionResult {
  return {
    completed: false,
    layer_used: layer,
    duration_ms: Date.now() - startTime,
    error: (error as Error).message,
  };
}
