/**
 * 出力抽出・検証エンジン
 *
 * AIサービスのレスポンスをHTMLから抽出し、完全性を検証。
 * 引用情報の構造的保持（Perplexity向け）。
 */

import type { Page } from 'playwright';
import type {
  OutputExtractionConfig,
  Citation,
  AIServiceName,
  SelectorChain,
} from '../types';
import { resolveSelector } from './selector-resolver';
import { createServiceLogger } from './logger';

const extractorLogger = createServiceLogger('output-extractor');

/** 抽出結果 */
interface ExtractionResult {
  content: string;
  html_content: string;
  citations: Citation[];
  word_count: number;
  validation: ValidationResult;
}

/** 検証結果 */
interface ValidationResult {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * AIサービスのレスポンスを抽出し、検証する。
 */
export async function extractOutput(
  page: Page,
  config: OutputExtractionConfig,
  serviceName: AIServiceName
): Promise<ExtractionResult> {
  extractorLogger.info(`Extracting output for ${serviceName}`);

  // HTML内容を取得
  const htmlContent = await extractHtmlContent(page, config.response_selector, serviceName);

  // テキスト内容を取得
  const textContent = await extractTextContent(page, config.response_selector, serviceName);

  // 引用情報を抽出
  const citations = config.citations?.enabled
    ? await extractCitations(page, config, serviceName)
    : [];

  // 検証
  const validation = validateOutput(textContent, citations, config.validation, serviceName);

  const result: ExtractionResult = {
    content: textContent,
    html_content: htmlContent,
    citations,
    word_count: textContent.length,
    validation,
  };

  if (validation.is_valid) {
    extractorLogger.info(
      `Output extraction successful for ${serviceName}: ${textContent.length} chars, ${citations.length} citations`
    );
  } else {
    extractorLogger.warn(
      `Output extraction completed with validation errors for ${serviceName}`,
      { errors: validation.errors, warnings: validation.warnings }
    );
  }

  return result;
}

/** HTML内容の抽出 */
async function extractHtmlContent(
  page: Page,
  selector: SelectorChain,
  serviceName: AIServiceName
): Promise<string> {
  try {
    const resolved = await resolveSelector(page, selector, 'response_content', 10000);
    const html = await resolved.locator.innerHTML();
    return html;
  } catch (err) {
    extractorLogger.error(
      `Failed to extract HTML content for ${serviceName}: ${(err as Error).message}`
    );
    return '';
  }
}

/** テキスト内容の抽出 */
async function extractTextContent(
  page: Page,
  selector: SelectorChain,
  serviceName: AIServiceName
): Promise<string> {
  try {
    const resolved = await resolveSelector(page, selector, 'response_content', 10000);
    const text = await resolved.locator.textContent();
    return (text ?? '').trim();
  } catch (err) {
    extractorLogger.error(
      `Failed to extract text content for ${serviceName}: ${(err as Error).message}`
    );
    return '';
  }
}

/**
 * 引用情報の構造的抽出
 *
 * インライン引用バッジと外部リンクの対応関係を保持。
 */
async function extractCitations(
  page: Page,
  config: OutputExtractionConfig,
  serviceName: AIServiceName
): Promise<Citation[]> {
  const citations: Citation[] = [];

  if (!config.citations) return citations;

  try {
    // 引用バッジの取得
    const badgeSelector = config.citations.badge_selector;
    const linkSelector = config.citations.link_selector;

    if (linkSelector) {
      const links = await page.locator(linkSelector).all();
      for (let i = 0; i < links.length; i++) {
        try {
          const href = await links[i].getAttribute('href');
          const title = await links[i].textContent();

          if (href) {
            citations.push({
              index: i + 1,
              title: (title ?? '').trim() || `Source ${i + 1}`,
              url: href,
            });
          }
        } catch {
          continue;
        }
      }
    }

    extractorLogger.debug(
      `Extracted ${citations.length} citations for ${serviceName}`
    );
  } catch (err) {
    extractorLogger.warn(
      `Citation extraction failed for ${serviceName}: ${(err as Error).message}`
    );
  }

  return citations;
}

/**
 * 出力完全性検証
 *
 * - 最低文字数チェック
 * - 必須セクション存在チェック
 * - 切断マーカー検知
 * - 引用連続性チェック（Perplexity用）
 */
function validateOutput(
  content: string,
  citations: Citation[],
  validationConfig: OutputExtractionConfig['validation'],
  serviceName: AIServiceName
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 最低文字数チェック
  if (content.length < validationConfig.min_length) {
    errors.push(
      `Content too short: ${content.length} chars (minimum: ${validationConfig.min_length})`
    );
  }

  // 必須セクション存在チェック
  if (validationConfig.required_sections) {
    for (const section of validationConfig.required_sections) {
      if (!content.toLowerCase().includes(section.toLowerCase())) {
        warnings.push(`Required section not found: "${section}"`);
      }
    }
  }

  // 切断マーカー検知
  if (validationConfig.truncation_markers) {
    for (const marker of validationConfig.truncation_markers) {
      if (content.endsWith(marker)) {
        warnings.push(`Possible truncation detected: ends with "${marker}"`);
      }
    }
  }

  // 引用連続性チェック
  if (validationConfig.citation_continuity && citations.length > 0) {
    const indices = citations.map((c) => c.index).sort((a, b) => a - b);
    for (let i = 0; i < indices.length - 1; i++) {
      if (indices[i + 1] - indices[i] > 1) {
        warnings.push(
          `Citation gap detected: [${indices[i]}] to [${indices[i + 1]}]`
        );
      }
    }
  }

  return {
    is_valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * HTML → Markdown 簡易変換
 *
 * パイプラインの後段フェーズで使用するためのMarkdown変換。
 */
export function htmlToMarkdown(html: string): string {
  let md = html;

  // ブロック要素の変換
  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
  md = md.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n');
  md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
  md = md.replace(/<br\s*\/?>/gi, '\n');

  // インライン要素の変換
  md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
  md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  md = md.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
  md = md.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');

  // リンク
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');

  // リスト
  md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
  md = md.replace(/<\/?[uo]l[^>]*>/gi, '\n');

  // コードブロック
  md = md.replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gis, '```\n$1\n```\n\n');

  // 残りのHTMLタグを除去
  md = md.replace(/<[^>]+>/g, '');

  // HTMLエンティティのデコード
  md = md.replace(/&amp;/g, '&');
  md = md.replace(/&lt;/g, '<');
  md = md.replace(/&gt;/g, '>');
  md = md.replace(/&quot;/g, '"');
  md = md.replace(/&#39;/g, "'");
  md = md.replace(/&nbsp;/g, ' ');

  // 連続空行の正規化
  md = md.replace(/\n{3,}/g, '\n\n');

  return md.trim();
}
