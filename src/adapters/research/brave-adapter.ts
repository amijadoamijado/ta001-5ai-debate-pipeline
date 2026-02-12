import { ResearchAdapter, CaseType } from './types.js';
import { ResearchOutput, Finding, DataPoint, Source } from '../../pipeline/types/index.js';
import { env } from '../../config/env.js';

/** Brave Search APIのレスポンス型 */
interface BraveWebResult {
  title: string;
  url: string;
  description: string;
  age?: string;
  extra_snippets?: string[];
}

interface BraveSearchResponse {
  query: { original: string };
  web?: { results: BraveWebResult[] };
}

/**
 * Brave Search API Adapter
 *
 * 広範なWeb検索に特化。プライバシー重視の検索エンジンで
 * 一般的な市場データ・ニュース・企業情報を収集する。
 *
 * 使用フェーズ: Phase 0, Phase 3, Phase 3.5
 */
export class BraveAdapter implements ResearchAdapter {
  name = 'Brave';
  role = 'Web Search - General market data and counter-evidence';

  private readonly baseUrl = 'https://api.search.brave.com/res/v1/web/search';

  async isAvailable(): Promise<boolean> {
    return !!env.braveApiKey;
  }

  async search(query: string, caseType: CaseType): Promise<ResearchOutput | null> {
    try {
      if (!env.braveApiKey) return null;

      const enhancedQuery = this.enhanceQuery(query, caseType);
      const url = `${this.baseUrl}?q=${encodeURIComponent(enhancedQuery)}&count=20`;

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip',
          'X-Subscription-Token': env.braveApiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Brave API responded with ${response.status}: ${response.statusText}`);
      }

      const data = await response.json() as BraveSearchResponse;

      return {
        ai_name: this.name,
        role: this.role,
        query: enhancedQuery,
        timestamp: new Date().toISOString(),
        findings: this.convertToFindings(data),
        data_points: this.convertToDataPoints(data),
        trends: [],
        risks: [],
        gaps: this.identifyGaps(data),
        sources: this.convertToSources(data),
        confidence: 0.7,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[${this.name}] Search failed: ${message}`);
      return null;
    }
  }

  /**
   * 案件タイプに応じてクエリを強化する
   */
  private enhanceQuery(query: string, caseType: CaseType): string {
    const suffixes: Record<CaseType, string> = {
      A: '市場規模 競合分析 新規事業',
      B: '改善事例 ROI 業務効率化',
      C: 'DX事例 デジタル変革 導入効果',
      D: 'リスク対策 危機管理 事例',
    };
    return `${query} ${suffixes[caseType]}`;
  }

  private convertToFindings(data: BraveSearchResponse): Finding[] {
    const results = data.web?.results ?? [];
    return results.slice(0, 10).map((result) => ({
      category: 'web_search',
      summary: result.title,
      details: result.description,
      evidence: [result.url, ...(result.extra_snippets ?? [])],
      confidence: 0.7,
    }));
  }

  private convertToDataPoints(data: BraveSearchResponse): DataPoint[] {
    const results = data.web?.results ?? [];
    return results
      .filter((r) => this.containsNumericData(r.description))
      .slice(0, 5)
      .map((result) => ({
        metric: result.title,
        value: this.extractNumericValue(result.description),
        unit: '',
        source: result.url,
        date: result.age ?? new Date().toISOString().split('T')[0] ?? '',
      }));
  }

  private convertToSources(data: BraveSearchResponse): Source[] {
    const results = data.web?.results ?? [];
    return results.map((result) => ({
      url: result.url,
      title: result.title,
      date: result.age ?? '',
      reliability: 'medium' as const,
    }));
  }

  private identifyGaps(data: BraveSearchResponse): string[] {
    const gaps: string[] = [];
    const resultCount = data.web?.results?.length ?? 0;
    if (resultCount < 5) {
      gaps.push('検索結果が少数のため、情報カバレッジに限界あり');
    }
    return gaps;
  }

  private containsNumericData(text: string): boolean {
    return /\d+[%億万兆円$]|\d+\.\d+/.test(text);
  }

  private extractNumericValue(text: string): string {
    const match = /(\d[\d,.]*\s*[%億万兆円$]?)/.exec(text);
    return match ? match[1] : '';
  }
}
