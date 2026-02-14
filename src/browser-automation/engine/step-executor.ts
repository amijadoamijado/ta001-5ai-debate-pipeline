/**
 * 操作ステップ実行エンジン
 *
 * YAMLレシピの各ステップを汎用的に実行。
 * セレクタ解決 → アクション実行 → スクリーンショット の統一フロー。
 */

import type { Page } from 'playwright';
import type {
  OperationStep,
  SelectorChain,
  SelectorUsageLog,
  AIServiceName,
  ScreenshotMeta,
} from '../types';
import { resolveSelector, createUsageLog, SelectorResolutionError } from './selector-resolver';
import { createServiceLogger } from './logger';
import path from 'path';
import fs from 'fs';

const stepLogger = createServiceLogger('step-executor');

/** ステップ実行結果 */
interface StepResult {
  step_name: string;
  success: boolean;
  error?: string;
  selector_log?: SelectorUsageLog;
  screenshot?: ScreenshotMeta;
  skipped?: boolean;
}

/**
 * 単一の操作ステップを実行する。
 */
export async function executeStep(
  page: Page,
  step: OperationStep,
  serviceName: AIServiceName,
  inputValue?: string,
  screenshotDir?: string
): Promise<StepResult> {
  stepLogger.info(`Executing step: ${step.name}`, {
    service: serviceName,
    action: step.action,
  });

  const result: StepResult = {
    step_name: step.name,
    success: false,
  };

  try {
    switch (step.action) {
      case 'navigate':
        await executeNavigate(page, step);
        break;

      case 'click':
        result.selector_log = await executeClick(page, step, serviceName);
        break;

      case 'type':
        result.selector_log = await executeType(page, step, serviceName, inputValue);
        break;

      case 'keyboard_type':
        result.selector_log = await executeKeyboardType(
          page,
          step,
          serviceName,
          inputValue
        );
        break;

      case 'toggle':
        result.selector_log = await executeToggle(page, step, serviceName);
        break;

      case 'check_visible':
        await executeCheckVisible(page, step, serviceName);
        break;

      case 'select':
        result.selector_log = await executeSelect(page, step, serviceName, inputValue);
        break;

      case 'wait':
        // waitはcompletion-detectorが処理するため、ここではスキップ
        result.skipped = true;
        break;

      case 'extract':
        // extractはoutput-extractorが処理するため、ここではスキップ
        result.skipped = true;
        break;

      case 'screenshot':
        // screenshotは各ステップで自動的に撮影
        break;
    }

    result.success = true;

    // スクリーンショット撮影
    if (step.screenshot && screenshotDir) {
      result.screenshot = await takeScreenshot(page, step.name, serviceName, screenshotDir);
    }
  } catch (err) {
    if (step.optional) {
      stepLogger.warn(`Optional step "${step.name}" failed: ${(err as Error).message}`, {
        service: serviceName,
      });
      result.success = true;
      result.skipped = true;
    } else {
      stepLogger.error(`Step "${step.name}" failed: ${(err as Error).message}`, {
        service: serviceName,
        error: (err as Error).message,
      });
      result.error = (err as Error).message;
    }
  }

  return result;
}

/** navigate アクション */
async function executeNavigate(page: Page, step: OperationStep): Promise<void> {
  if (!step.value) {
    throw new Error('Navigate step requires a value (URL)');
  }
  await page.goto(step.value, {
    waitUntil: 'domcontentloaded',
    timeout: step.timeout ?? 30000,
  });
}

/** click アクション */
async function executeClick(
  page: Page,
  step: OperationStep,
  serviceName: AIServiceName
): Promise<SelectorUsageLog | undefined> {
  if (!step.selector) {
    throw new Error(`Click step "${step.name}" requires a selector`);
  }

  const resolved = await resolveSelector(
    page,
    step.selector,
    step.name,
    step.timeout ?? 5000
  );

  await resolved.locator.click({ timeout: step.timeout ?? 5000 });

  // クリック後の安定化待ち
  await page.waitForTimeout(500);

  return createUsageLog(step.name, resolved);
}

/** type アクション（page.fill使用） */
async function executeType(
  page: Page,
  step: OperationStep,
  serviceName: AIServiceName,
  inputValue?: string
): Promise<SelectorUsageLog | undefined> {
  if (!step.selector) {
    throw new Error(`Type step "${step.name}" requires a selector`);
  }

  const value = inputValue ?? step.value ?? '';
  const resolved = await resolveSelector(
    page,
    step.selector,
    step.name,
    step.timeout ?? 5000
  );

  await resolved.locator.fill(value, { timeout: step.timeout ?? 10000 });

  return createUsageLog(step.name, resolved);
}

/**
 * keyboard_type アクション
 *
 * ProseMirror等のcontenteditable要素向け。
 * page.fill()では動作しないため、keyboard.type()を使用。
 * 人間的なタイピング遅延を模倣。
 */
async function executeKeyboardType(
  page: Page,
  step: OperationStep,
  serviceName: AIServiceName,
  inputValue?: string
): Promise<SelectorUsageLog | undefined> {
  if (!step.selector) {
    throw new Error(`KeyboardType step "${step.name}" requires a selector`);
  }

  const value = inputValue ?? step.value ?? '';
  const resolved = await resolveSelector(
    page,
    step.selector,
    step.name,
    step.timeout ?? 5000
  );

  // 要素にフォーカス
  await resolved.locator.click({ timeout: step.timeout ?? 5000 });
  await page.waitForTimeout(200);

  // 既存テキストをクリア
  await page.keyboard.press('Meta+a');
  await page.keyboard.press('Backspace');
  await page.waitForTimeout(100);

  // 人間的な速度でタイピング（30-80ms/文字）
  await page.keyboard.type(value, { delay: 50 });

  return createUsageLog(step.name, resolved);
}

/** toggle アクション */
async function executeToggle(
  page: Page,
  step: OperationStep,
  serviceName: AIServiceName
): Promise<SelectorUsageLog | undefined> {
  if (!step.selector) {
    throw new Error(`Toggle step "${step.name}" requires a selector`);
  }

  const resolved = await resolveSelector(
    page,
    step.selector,
    step.name,
    step.timeout ?? 5000
  );

  await resolved.locator.click({ timeout: step.timeout ?? 5000 });
  await page.waitForTimeout(300);

  return createUsageLog(step.name, resolved);
}

/** check_visible アクション */
async function executeCheckVisible(
  page: Page,
  step: OperationStep,
  serviceName: AIServiceName
): Promise<void> {
  if (!step.selector) {
    throw new Error(`CheckVisible step "${step.name}" requires a selector`);
  }

  const resolved = await resolveSelector(
    page,
    step.selector,
    step.name,
    step.timeout ?? 10000
  );

  const visible = await resolved.locator.isVisible();
  if (!visible) {
    throw new Error(`Element not visible for step "${step.name}"`);
  }
}

/** select アクション */
async function executeSelect(
  page: Page,
  step: OperationStep,
  serviceName: AIServiceName,
  inputValue?: string
): Promise<SelectorUsageLog | undefined> {
  if (!step.selector) {
    throw new Error(`Select step "${step.name}" requires a selector`);
  }

  const resolved = await resolveSelector(
    page,
    step.selector,
    step.name,
    step.timeout ?? 5000
  );

  const value = inputValue ?? step.value ?? '';
  await resolved.locator.selectOption(value, { timeout: step.timeout ?? 5000 });

  return createUsageLog(step.name, resolved);
}

/** スクリーンショット撮影 */
async function takeScreenshot(
  page: Page,
  stepName: string,
  serviceName: AIServiceName,
  screenshotDir: string
): Promise<ScreenshotMeta> {
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${serviceName}_${stepName}_${timestamp}.png`;
  const filepath = path.join(screenshotDir, filename);

  await page.screenshot({ path: filepath, fullPage: false });

  stepLogger.debug(`Screenshot saved: ${filename}`, {
    service: serviceName,
    step: stepName,
  });

  return {
    path: filepath,
    step_name: stepName,
    timestamp: new Date().toISOString(),
    service: serviceName,
  };
}
