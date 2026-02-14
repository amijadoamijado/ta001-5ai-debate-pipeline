/**
 * エラーハンドリング・リトライ戦略
 *
 * CAPTCHA検知、セッション期限切れ、レート制限の自動検出とリカバリ。
 * 指数バックオフ付きリトライ。
 */

import type { Page } from 'playwright';
import type {
  ErrorDetectionPattern,
  CaptchaDetectionConfig,
  AIServiceName,
} from '../types';
import { createServiceLogger } from './logger';
import path from 'path';
import fs from 'fs';

const errorLogger = createServiceLogger('error-handler');

/** エラー検出結果 */
interface ErrorDetection {
  detected: boolean;
  pattern_name?: string;
  recovery_action?: string;
  screenshot_path?: string;
}

/** リトライ設定 */
interface RetryConfig {
  max_retries: number;
  base_delay_ms: number;
  multiplier: number;
  max_delay_ms: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  max_retries: 3,
  base_delay_ms: 2000,
  multiplier: 2,
  max_delay_ms: 30000,
};

/**
 * ページ上のエラーパターンを検出する。
 */
export async function detectErrors(
  page: Page,
  patterns: ErrorDetectionPattern[],
  serviceName: AIServiceName
): Promise<ErrorDetection> {
  for (const pattern of patterns) {
    try {
      const element = page.locator(pattern.selector);
      const isVisible = await element.isVisible().catch(() => false);

      if (isVisible) {
        errorLogger.warn(`Error pattern detected: ${pattern.name}`, {
          service: serviceName,
          pattern: pattern.name,
          recovery: pattern.recovery_action,
        });

        return {
          detected: true,
          pattern_name: pattern.name,
          recovery_action: pattern.recovery_action,
        };
      }
    } catch {
      continue;
    }
  }

  return { detected: false };
}

/**
 * CAPTCHA検知
 */
export async function detectCaptcha(
  page: Page,
  config: CaptchaDetectionConfig,
  serviceName: AIServiceName,
  screenshotDir?: string
): Promise<ErrorDetection> {
  for (const selector of config.selectors) {
    try {
      const isVisible = await page.locator(selector).isVisible().catch(() => false);

      if (isVisible) {
        errorLogger.error(`CAPTCHA detected for ${serviceName}`, {
          service: serviceName,
          selector,
        });

        let screenshotPath: string | undefined;
        if (screenshotDir && config.escalation.screenshot) {
          screenshotPath = await takeCaptchaScreenshot(page, serviceName, screenshotDir);
        }

        return {
          detected: true,
          pattern_name: 'captcha',
          recovery_action: 'screenshot_escalate',
          screenshot_path: screenshotPath,
        };
      }
    } catch {
      continue;
    }
  }

  return { detected: false };
}

/**
 * 指数バックオフ付きリトライ実行
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= retryConfig.max_retries; attempt++) {
    try {
      return await operation();
    } catch (err) {
      lastError = err as Error;

      if (attempt === retryConfig.max_retries) {
        errorLogger.error(
          `${operationName} failed after ${retryConfig.max_retries + 1} attempts: ${lastError.message}`
        );
        break;
      }

      const delay = Math.min(
        retryConfig.base_delay_ms * Math.pow(retryConfig.multiplier, attempt),
        retryConfig.max_delay_ms
      );

      errorLogger.warn(
        `${operationName} attempt ${attempt + 1} failed, retrying in ${delay}ms: ${lastError.message}`
      );

      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * エラーリカバリアクションを実行
 */
export async function executeRecovery(
  page: Page,
  detection: ErrorDetection,
  serviceName: AIServiceName,
  screenshotDir?: string
): Promise<boolean> {
  switch (detection.recovery_action) {
    case 'retry':
      errorLogger.info(`Retry recovery for ${serviceName}: ${detection.pattern_name}`);
      // ページリロードで状態をリセット
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
      await sleep(2000);
      return true;

    case 'screenshot_escalate':
      errorLogger.error(
        `Escalation required for ${serviceName}: ${detection.pattern_name}. Human intervention needed.`,
        { service: serviceName }
      );
      if (screenshotDir) {
        await takeEscalationScreenshot(page, serviceName, detection.pattern_name ?? 'unknown', screenshotDir);
      }
      return false;

    case 'skip':
      errorLogger.warn(
        `Skipping ${serviceName} due to: ${detection.pattern_name}`
      );
      return false;

    case 'reauth':
      errorLogger.warn(
        `Re-authentication required for ${serviceName}. Session expired.`,
        { service: serviceName }
      );
      return false;

    default:
      errorLogger.warn(`Unknown recovery action: ${detection.recovery_action}`);
      return false;
  }
}

/** CAPTCHA検知時のスクリーンショット */
async function takeCaptchaScreenshot(
  page: Page,
  serviceName: AIServiceName,
  screenshotDir: string
): Promise<string> {
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${serviceName}_CAPTCHA_${timestamp}.png`;
  const filepath = path.join(screenshotDir, filename);

  await page.screenshot({ path: filepath, fullPage: true });
  errorLogger.info(`CAPTCHA screenshot saved: ${filepath}`);

  return filepath;
}

/** エスカレーション用スクリーンショット */
async function takeEscalationScreenshot(
  page: Page,
  serviceName: AIServiceName,
  errorName: string,
  screenshotDir: string
): Promise<string> {
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${serviceName}_ESCALATION_${errorName}_${timestamp}.png`;
  const filepath = path.join(screenshotDir, filename);

  await page.screenshot({ path: filepath, fullPage: true });
  errorLogger.info(`Escalation screenshot saved: ${filepath}`);

  return filepath;
}

/** ユーティリティ: sleep */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
