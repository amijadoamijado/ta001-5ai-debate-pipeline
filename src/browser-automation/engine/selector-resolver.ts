/**
 * セレクタ解決エンジン
 *
 * フォールバックチェーン付きセレクタ解決。
 * primary → fallback_1 → fallback_2 → fallback_3 の順で試行。
 * どのセレクタで成功したかをログに記録し、UI変更検知に活用。
 */

import type { Page, Locator } from 'playwright';
import type { SelectorChain, SelectorUsageLog } from '../types';
import { createServiceLogger } from './logger';

const selectorLogger = createServiceLogger('selector-resolver');

/** セレクタ解決結果 */
interface ResolvedSelector {
  locator: Locator;
  selector_used: string;
  is_fallback: boolean;
  fallback_level: number;
}

/**
 * フォールバックチェーンを順に試行し、最初に見つかった要素を返す。
 *
 * @param page Playwrightページ
 * @param chain セレクタチェーン
 * @param elementName 要素名（ログ用）
 * @param timeout 各セレクタの試行タイムアウト（ms）
 */
export async function resolveSelector(
  page: Page,
  chain: SelectorChain,
  elementName: string,
  timeout: number = 2000
): Promise<ResolvedSelector> {
  const selectors = buildSelectorList(chain);

  for (let i = 0; i < selectors.length; i++) {
    const selector = selectors[i];
    try {
      const locator = page.locator(selector);
      await locator.first().waitFor({ state: 'visible', timeout });

      const isFallback = i > 0;
      if (isFallback) {
        selectorLogger.warn(
          `Fallback selector used for "${elementName}": level ${i} (${selector})`,
          { elementName, fallbackLevel: i, selector }
        );
      } else {
        selectorLogger.debug(
          `Primary selector resolved for "${elementName}"`,
          { elementName, selector }
        );
      }

      return {
        locator: locator.first(),
        selector_used: selector,
        is_fallback: isFallback,
        fallback_level: i,
      };
    } catch {
      selectorLogger.debug(
        `Selector failed for "${elementName}": level ${i} (${selector})`,
        { elementName, fallbackLevel: i, selector }
      );
    }
  }

  throw new SelectorResolutionError(elementName, selectors);
}

/**
 * セレクタチェーンが要素を見つけられるか検査（待機なし）
 */
export async function checkSelectorExists(
  page: Page,
  chain: SelectorChain,
  timeout: number = 1000
): Promise<boolean> {
  const selectors = buildSelectorList(chain);

  for (const selector of selectors) {
    try {
      const locator = page.locator(selector);
      const count = await locator.count();
      if (count > 0) {
        const visible = await locator.first().isVisible();
        if (visible) return true;
      }
    } catch {
      continue;
    }
  }

  return false;
}

/** セレクタ使用ログの生成 */
export function createUsageLog(
  elementName: string,
  resolved: ResolvedSelector
): SelectorUsageLog {
  return {
    element_name: elementName,
    selector_used: resolved.selector_used,
    is_fallback: resolved.is_fallback,
    fallback_level: resolved.fallback_level,
  };
}

/** SelectorChainからセレクタ文字列配列を構築 */
function buildSelectorList(chain: SelectorChain): string[] {
  const list: string[] = [chain.primary];
  if (chain.fallback_1) list.push(chain.fallback_1);
  if (chain.fallback_2) list.push(chain.fallback_2);
  if (chain.fallback_3) list.push(chain.fallback_3);
  return list;
}

/** セレクタ解決失敗エラー */
export class SelectorResolutionError extends Error {
  readonly elementName: string;
  readonly triedSelectors: string[];

  constructor(elementName: string, triedSelectors: string[]) {
    super(
      `All selectors failed for "${elementName}". Tried: ${triedSelectors.join(', ')}`
    );
    this.name = 'SelectorResolutionError';
    this.elementName = elementName;
    this.triedSelectors = triedSelectors;
  }
}
