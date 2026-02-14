/**
 * サービス実行エンジン
 *
 * YAML設定を解釈し、汎用的にAIサービスの操作フローを実行する。
 * セレクタ解決 → ステップ実行 → 完了検知 → 出力抽出 の統一フロー。
 */

import type { Page, BrowserContext } from 'playwright';
import type {
  AIServiceConfig,
  AIServiceName,
  OperationResult,
  SelectorUsageLog,
  ScreenshotMeta,
} from '../types';
import { executeStep } from './step-executor';
import { waitForCompletion } from './completion-detector';
import { extractOutput, htmlToMarkdown } from './output-extractor';
import { detectErrors, detectCaptcha, executeRecovery, withRetry } from './error-handler';
import { ensureAuthenticated, saveSession } from './session-manager';
import { createServiceLogger } from './logger';

const runnerLogger = createServiceLogger('service-runner');

/**
 * 単一AIサービスの全操作フローを実行する。
 *
 * 1. セッション確認
 * 2. 操作ステップ順次実行
 * 3. 完了検知
 * 4. 出力抽出・検証
 * 5. セッション保存
 */
export async function runService(
  page: Page,
  context: BrowserContext,
  config: AIServiceConfig,
  prompt: string,
  screenshotDir?: string
): Promise<OperationResult> {
  const startTime = Date.now();
  const selectorLogs: SelectorUsageLog[] = [];
  const screenshots: string[] = [];

  runnerLogger.info(`Starting automation for ${config.display_name}`, {
    service: config.service_name,
    steps: config.operation_steps.length,
  });

  try {
    // Phase 1: セッション確認
    const sessionStatus = await ensureAuthenticated(page, context, config);
    if (!sessionStatus.valid) {
      return createFailedResult(
        config.service_name,
        'Session invalid. Manual login required.',
        startTime,
        selectorLogs,
        screenshots
      );
    }

    // Phase 2: CAPTCHA事前チェック
    const captchaCheck = await detectCaptcha(
      page,
      config.captcha_detection,
      config.service_name,
      screenshotDir
    );
    if (captchaCheck.detected) {
      if (captchaCheck.screenshot_path) {
        screenshots.push(captchaCheck.screenshot_path);
      }
      return createFailedResult(
        config.service_name,
        'CAPTCHA detected. Human intervention required.',
        startTime,
        selectorLogs,
        screenshots
      );
    }

    // Phase 3: 操作ステップ実行
    let completionTimeout = 1800000; // デフォルト30分

    for (const step of config.operation_steps) {
      // waitステップはcompletion-detectorが処理
      if (step.action === 'wait') {
        completionTimeout = step.timeout ?? completionTimeout;
        continue;
      }

      // extractステップはPhase 5で処理
      if (step.action === 'extract') {
        continue;
      }

      // 入力値の設定（プロンプト入力ステップ）
      const isInputStep =
        step.action === 'type' ||
        step.action === 'keyboard_type';
      const inputValue = isInputStep && step.name.includes('input') ? prompt : undefined;

      const stepResult = await executeStep(
        page,
        step,
        config.service_name,
        inputValue,
        screenshotDir
      );

      if (!stepResult.success && !stepResult.skipped) {
        // エラーパターン検出
        const errorDetection = await detectErrors(
          page,
          config.error_patterns,
          config.service_name
        );

        if (errorDetection.detected) {
          const recovered = await executeRecovery(
            page,
            errorDetection,
            config.service_name,
            screenshotDir
          );

          if (!recovered) {
            return createFailedResult(
              config.service_name,
              `Step "${step.name}" failed with error: ${errorDetection.pattern_name}`,
              startTime,
              selectorLogs,
              screenshots
            );
          }
        } else {
          return createFailedResult(
            config.service_name,
            `Step "${step.name}" failed: ${stepResult.error}`,
            startTime,
            selectorLogs,
            screenshots
          );
        }
      }

      if (stepResult.selector_log) {
        selectorLogs.push(stepResult.selector_log);
      }

      if (stepResult.screenshot?.path) {
        screenshots.push(stepResult.screenshot.path);
      }
    }

    // Phase 4: 完了検知
    runnerLogger.info(`Waiting for completion (timeout: ${completionTimeout}ms)`, {
      service: config.service_name,
    });

    const completionResult = await withRetry(
      async () => {
        // 完了検知前にエラーチェック
        const errorCheck = await detectErrors(
          page,
          config.error_patterns,
          config.service_name
        );
        if (errorCheck.detected) {
          const recovered = await executeRecovery(
            page,
            errorCheck,
            config.service_name,
            screenshotDir
          );
          if (!recovered) {
            throw new Error(`Error during generation: ${errorCheck.pattern_name}`);
          }
        }

        return waitForCompletion(
          page,
          config.completion_detection,
          config.service_name,
          completionTimeout
        );
      },
      `completion-detection-${config.service_name}`,
      { max_retries: 1, base_delay_ms: 5000 }
    );

    // Phase 5: 出力抽出
    const extraction = await extractOutput(
      page,
      config.output_extraction,
      config.service_name
    );

    // コンテンツ優先順位: ネットワーク層 > DOM抽出
    const finalContent = completionResult.content
      ? completionResult.content
      : extraction.content;

    // Phase 6: セッション保存
    await saveSession(page, context, config);

    // 成功結果
    return {
      service: config.service_name,
      success: true,
      content: finalContent,
      citations: extraction.citations,
      screenshots,
      timing: {
        started_at: new Date(startTime).toISOString(),
        completed_at: new Date().toISOString(),
        duration_ms: Date.now() - startTime,
      },
      selector_usage: selectorLogs,
      completion_layer_used: completionResult.layer_used,
    };
  } catch (err) {
    runnerLogger.error(
      `Automation failed for ${config.service_name}: ${(err as Error).message}`,
      { service: config.service_name, error: (err as Error).message }
    );

    // 失敗時もスクリーンショットを試行
    if (screenshotDir) {
      try {
        const errScreenshot = await captureErrorScreenshot(
          page,
          config.service_name,
          screenshotDir
        );
        screenshots.push(errScreenshot);
      } catch {
        // スクリーンショット取得失敗は無視
      }
    }

    return createFailedResult(
      config.service_name,
      (err as Error).message,
      startTime,
      selectorLogs,
      screenshots
    );
  }
}

/** 失敗結果を生成 */
function createFailedResult(
  service: AIServiceName,
  error: string,
  startTime: number,
  selectorLogs: SelectorUsageLog[],
  screenshots: string[]
): OperationResult {
  return {
    service,
    success: false,
    error,
    screenshots,
    timing: {
      started_at: new Date(startTime).toISOString(),
      completed_at: new Date().toISOString(),
      duration_ms: Date.now() - startTime,
    },
    selector_usage: selectorLogs,
  };
}

/** エラー時のスクリーンショット */
async function captureErrorScreenshot(
  page: Page,
  serviceName: AIServiceName,
  screenshotDir: string
): Promise<string> {
  const fs = await import('fs');
  const path = await import('path');

  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filepath = path.join(screenshotDir, `${serviceName}_ERROR_${timestamp}.png`);
  await page.screenshot({ path: filepath, fullPage: true });

  return filepath;
}
