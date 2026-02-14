/**
 * セッション管理
 *
 * PlaywrightのstorageState永続化とセッション有効性チェック。
 * sessionStorageの明示的な保存/復元（Playwrightの制約対応）。
 */

import type { BrowserContext, Page } from 'playwright';
import type { AIServiceConfig, AIServiceName } from '../types';
import { resolveSelector } from './selector-resolver';
import { createServiceLogger } from './logger';
import fs from 'fs';
import path from 'path';

const sessionLogger = createServiceLogger('session-manager');

/** セッション状態 */
interface SessionStatus {
  valid: boolean;
  service: AIServiceName;
  checked_at: string;
  storage_state_exists: boolean;
  session_storage_exists: boolean;
}

/**
 * セッション有効性を確認し、必要に応じて再認証を促す。
 *
 * 1. storageState の存在チェック
 * 2. ページに遷移してヘルスチェックセレクタの表示を確認
 * 3. sessionStorage の復元（存在する場合）
 */
export async function ensureAuthenticated(
  page: Page,
  context: BrowserContext,
  config: AIServiceConfig
): Promise<SessionStatus> {
  const status: SessionStatus = {
    valid: false,
    service: config.service_name,
    checked_at: new Date().toISOString(),
    storage_state_exists: false,
    session_storage_exists: false,
  };

  // storageState ファイルの存在チェック
  const storageStatePath = path.resolve(process.cwd(), config.auth.storage_state_path);
  status.storage_state_exists = fs.existsSync(storageStatePath);

  if (!status.storage_state_exists) {
    sessionLogger.warn(
      `No storage state found for ${config.service_name}. Manual login required.`,
      { path: storageStatePath }
    );
    return status;
  }

  // sessionStorage の復元
  if (config.auth.session_storage_path) {
    const sessionStoragePath = path.resolve(
      process.cwd(),
      config.auth.session_storage_path
    );
    status.session_storage_exists = fs.existsSync(sessionStoragePath);

    if (status.session_storage_exists) {
      await restoreSessionStorage(page, sessionStoragePath);
    }
  }

  // ページ遷移してヘルスチェック
  try {
    await page.goto(config.base_url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    const healthCheckSelector = config.auth.health_check_selector;
    const isAuthenticated = await page
      .locator(healthCheckSelector)
      .isVisible({ timeout: 10000 })
      .catch(() => false);

    status.valid = isAuthenticated;

    if (isAuthenticated) {
      sessionLogger.info(`Session valid for ${config.service_name}`);
    } else {
      sessionLogger.warn(
        `Session expired for ${config.service_name}. Re-authentication required.`,
        { healthCheckSelector }
      );
    }
  } catch (err) {
    sessionLogger.error(
      `Session check failed for ${config.service_name}: ${(err as Error).message}`
    );
  }

  return status;
}

/**
 * 現在のセッション状態を保存。
 *
 * storageState + sessionStorage を両方保存。
 */
export async function saveSession(
  page: Page,
  context: BrowserContext,
  config: AIServiceConfig
): Promise<void> {
  // storageState保存
  const storageStatePath = path.resolve(process.cwd(), config.auth.storage_state_path);
  const dir = path.dirname(storageStatePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  await context.storageState({ path: storageStatePath });
  sessionLogger.info(`Storage state saved for ${config.service_name}`, {
    path: storageStatePath,
  });

  // sessionStorage保存（Playwrightは自動保存しないため手動対応）
  if (config.auth.session_storage_path) {
    const sessionStoragePath = path.resolve(
      process.cwd(),
      config.auth.session_storage_path
    );
    await saveSessionStorage(page, sessionStoragePath);
    sessionLogger.info(`Session storage saved for ${config.service_name}`, {
      path: sessionStoragePath,
    });
  }
}

/**
 * sessionStorage をJSONファイルに保存
 */
async function saveSessionStorage(page: Page, filePath: string): Promise<void> {
  const sessionData = await page.evaluate(() => {
    const data: Record<string, string> = {};
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key !== null) {
        const value = sessionStorage.getItem(key);
        if (value !== null) {
          data[key] = value;
        }
      }
    }
    return JSON.stringify(data);
  });

  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filePath, sessionData, 'utf-8');
}

/**
 * JSONファイルからsessionStorageを復元
 */
async function restoreSessionStorage(page: Page, filePath: string): Promise<void> {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data: Record<string, string> = JSON.parse(raw);

    await page.evaluate((entries: Record<string, string>) => {
      for (const [key, value] of Object.entries(entries)) {
        sessionStorage.setItem(key, value);
      }
    }, data);

    sessionLogger.debug('Session storage restored', {
      keys: Object.keys(data).length,
    });
  } catch (err) {
    sessionLogger.warn(`Failed to restore session storage: ${(err as Error).message}`);
  }
}

/**
 * レート制限チェック。
 * 最終実行時刻と比較して、最小間隔を満たしているか確認。
 */
export function checkRateLimit(
  config: AIServiceConfig,
  lastExecutionTime: number | null
): { allowed: boolean; wait_ms: number } {
  if (lastExecutionTime === null) {
    return { allowed: true, wait_ms: 0 };
  }

  const elapsed = Date.now() - lastExecutionTime;
  const minInterval = config.rate_limit.min_interval_ms;

  if (elapsed >= minInterval) {
    return { allowed: true, wait_ms: 0 };
  }

  return { allowed: false, wait_ms: minInterval - elapsed };
}
