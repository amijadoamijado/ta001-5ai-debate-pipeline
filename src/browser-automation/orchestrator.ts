/**
 * オーケストレータ
 *
 * 4サービスの逐次/並列実行を制御。
 * パイプラインのPhase 0（5AI Deep Research）の実行エンジン。
 *
 * アーキテクチャ:
 * ┌─────────────────────┐
 * │  オーケストレータ     │  パイプライン制御、結果集約
 * └──────────┬──────────┘
 *            │
 *     ┌──────▼──────┐
 *     │ 汎用エンジン │  YAML解釈、セレクタ解決、待機、リトライ
 *     └──────┬──────┘
 *            │
 *   ┌────────┼────────┬──────────┐
 *   ▼        ▼        ▼          ▼
 * chatgpt  gemini   grok    perplexity
 * .yaml    .yaml    .yaml     .yaml
 */

import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import type {
  AIServiceName,
  OrchestratorOptions,
  OrchestratorResult,
  OperationResult,
  AIServiceConfig,
} from './types';
import {
  loadServiceConfig,
  checkRateLimit,
  runService,
  logger,
  createServiceLogger,
} from './engine';
import fs from 'fs';
import path from 'path';

const orchLogger = createServiceLogger('orchestrator');

/** 各サービスの最終実行時刻 */
const lastExecutionTimes: Partial<Record<AIServiceName, number>> = {};

/**
 * Phase 0 リサーチオーケストレーションを実行。
 *
 * @param options 実行オプション
 * @returns 全サービスの集約結果
 */
export async function runPhase0Research(
  options: OrchestratorOptions
): Promise<OrchestratorResult> {
  const startTime = new Date();
  const results: Partial<Record<AIServiceName, OperationResult>> = {};

  orchLogger.info('Starting Phase 0 Research Orchestration', {
    pipeline_id: options.pipeline_id,
    services: options.services,
    parallel: options.parallel ?? false,
  });

  // スクリーンショットディレクトリ
  const screenshotDir = options.screenshot_dir
    ? path.resolve(options.screenshot_dir)
    : path.resolve(process.cwd(), 'logs', 'screenshots', options.pipeline_id);

  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  // 設定ファイル読み込み
  const configs: Map<AIServiceName, AIServiceConfig> = new Map();
  for (const serviceName of options.services) {
    try {
      const config = loadServiceConfig(serviceName);
      configs.set(serviceName, config);
    } catch (err) {
      orchLogger.error(`Failed to load config for ${serviceName}: ${(err as Error).message}`);
      results[serviceName] = createSkippedResult(serviceName, (err as Error).message);
    }
  }

  if (options.parallel) {
    // 並列実行（各サービス別のブラウザコンテキスト）
    const promises: Promise<void>[] = [];

    for (const [serviceName, config] of configs.entries()) {
      promises.push(
        executeServiceInContext(
          serviceName,
          config,
          options,
          screenshotDir,
          results
        )
      );
    }

    await Promise.allSettled(promises);
  } else {
    // 逐次実行（推奨: ブラウザ検知リスク低減）
    for (const [serviceName, config] of configs.entries()) {
      await executeServiceInContext(
        serviceName,
        config,
        options,
        screenshotDir,
        results
      );
    }
  }

  // 結果集約
  const completedAt = new Date();
  const summary = summarizeResults(results, options.services);

  const orchestratorResult: OrchestratorResult = {
    pipeline_id: options.pipeline_id,
    started_at: startTime.toISOString(),
    completed_at: completedAt.toISOString(),
    results: results as Record<AIServiceName, OperationResult>,
    summary,
  };

  orchLogger.info('Phase 0 Research Orchestration completed', {
    pipeline_id: options.pipeline_id,
    ...summary,
    duration_ms: completedAt.getTime() - startTime.getTime(),
  });

  return orchestratorResult;
}

/**
 * 個別サービスをブラウザコンテキスト内で実行。
 */
async function executeServiceInContext(
  serviceName: AIServiceName,
  config: AIServiceConfig,
  options: OrchestratorOptions,
  screenshotDir: string,
  results: Partial<Record<AIServiceName, OperationResult>>
): Promise<void> {
  // レート制限チェック
  const rateCheck = checkRateLimit(config, lastExecutionTimes[serviceName] ?? null);
  if (!rateCheck.allowed) {
    orchLogger.info(
      `Rate limit: waiting ${rateCheck.wait_ms}ms for ${serviceName}`
    );
    await sleep(rateCheck.wait_ms);
  }

  let browser: Browser | undefined;
  let context: BrowserContext | undefined;

  try {
    // ブラウザ起動
    browser = await chromium.launch({
      headless: options.headless ?? false,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox',
      ],
    });

    // storageState からコンテキスト作成
    const storageStatePath = path.resolve(process.cwd(), config.auth.storage_state_path);
    const contextOptions: Parameters<Browser['newContext']>[0] = {
      viewport: { width: 1920, height: 1080 },
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    };

    if (fs.existsSync(storageStatePath)) {
      contextOptions.storageState = storageStatePath;
    }

    context = await browser.newContext(contextOptions);
    const page = await context.newPage();

    // タイムアウト設定
    page.setDefaultTimeout(options.timeout_per_service_ms ?? 1800000);

    // サービス実行
    const result = await runService(
      page,
      context,
      config,
      options.prompt,
      screenshotDir
    );

    results[serviceName] = result;
    lastExecutionTimes[serviceName] = Date.now();
  } catch (err) {
    orchLogger.error(
      `Unhandled error for ${serviceName}: ${(err as Error).message}`
    );
    results[serviceName] = createSkippedResult(serviceName, (err as Error).message);
  } finally {
    if (context) {
      await context.close().catch(() => {});
    }
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}

/** 結果のサマリーを生成 */
function summarizeResults(
  results: Partial<Record<AIServiceName, OperationResult>>,
  services: AIServiceName[]
): OrchestratorResult['summary'] {
  let succeeded = 0;
  let failed = 0;
  let skipped = 0;

  for (const service of services) {
    const result = results[service];
    if (!result) {
      skipped++;
    } else if (result.success) {
      succeeded++;
    } else {
      failed++;
    }
  }

  return {
    total: services.length,
    succeeded,
    failed,
    skipped,
  };
}

/** スキップされたサービスの結果 */
function createSkippedResult(
  service: AIServiceName,
  error: string
): OperationResult {
  const now = new Date().toISOString();
  return {
    service,
    success: false,
    error: `Skipped: ${error}`,
    screenshots: [],
    timing: {
      started_at: now,
      completed_at: now,
      duration_ms: 0,
    },
    selector_usage: [],
  };
}

/** 結果をJSON/Markdownファイルに保存 */
export async function saveResults(
  result: OrchestratorResult,
  outputDir: string
): Promise<{ jsonPath: string; mdPath: string }> {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // JSON保存
  const jsonPath = path.join(outputDir, 'phase0_browser_research.json');
  fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2), 'utf-8');

  // Markdown保存
  const mdPath = path.join(outputDir, 'phase0_browser_research.md');
  const mdContent = generateMarkdownReport(result);
  fs.writeFileSync(mdPath, mdContent, 'utf-8');

  orchLogger.info('Results saved', { jsonPath, mdPath });

  return { jsonPath, mdPath };
}

/** Markdownレポートを生成 */
function generateMarkdownReport(result: OrchestratorResult): string {
  const lines: string[] = [
    '# Phase 0: Browser AI Research Results',
    '',
    `**Pipeline ID**: ${result.pipeline_id}`,
    `**Started**: ${result.started_at}`,
    `**Completed**: ${result.completed_at}`,
    `**Summary**: ${result.summary.succeeded}/${result.summary.total} succeeded, ${result.summary.failed} failed, ${result.summary.skipped} skipped`,
    '',
    '---',
    '',
  ];

  for (const [service, opResult] of Object.entries(result.results)) {
    lines.push(`## ${service.toUpperCase()}`);
    lines.push('');

    if (opResult.success) {
      lines.push(`**Status**: Success`);
      lines.push(`**Duration**: ${opResult.timing.duration_ms}ms`);
      lines.push(`**Completion Layer**: ${opResult.completion_layer_used ?? 'N/A'}`);
      lines.push(`**Citations**: ${opResult.citations?.length ?? 0}`);
      lines.push('');
      lines.push('### Content');
      lines.push('');
      lines.push(opResult.content ?? '_No content extracted_');

      if (opResult.citations && opResult.citations.length > 0) {
        lines.push('');
        lines.push('### Sources');
        lines.push('');
        for (const citation of opResult.citations) {
          lines.push(`${citation.index}. [${citation.title}](${citation.url})`);
        }
      }
    } else {
      lines.push(`**Status**: Failed`);
      lines.push(`**Error**: ${opResult.error}`);
    }

    // セレクタ使用状況（フォールバック発動チェック）
    const fallbacks = opResult.selector_usage.filter((s) => s.is_fallback);
    if (fallbacks.length > 0) {
      lines.push('');
      lines.push('### Selector Fallback Warnings');
      lines.push('');
      for (const fb of fallbacks) {
        lines.push(
          `- **${fb.element_name}**: Used fallback level ${fb.fallback_level} (${fb.selector_used})`
        );
      }
    }

    lines.push('');
    lines.push('---');
    lines.push('');
  }

  return lines.join('\n');
}

/** ユーティリティ: sleep */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
