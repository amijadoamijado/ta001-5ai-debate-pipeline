import { ResearchAdapter, CaseType } from './types.js';
import { ResearchOutput, Finding, DataPoint, Source } from '../../pipeline/types/index.js';
import { env } from '../../config/env.js';

/** Tavily Search APIのレスポンス型 */
interface TavilyResult {
  title: string;
  url: string;
  content: string;
  score: number;
  published_date?: string;
  raw_content?: string;
}

interface TavilySearchResponse {
  query: string;
  results: TavilyResult[];
  answer?: string;
  response_time: number;
}

/**
 * Tavily Search API Adapter
 *
 * LLM最適化検索に特化。構造化されたビジネスデータや
 * 数値情報の取得に強い。AIエージェント向けに設計された
 * 検索APIで、要約付きの構造化レスポンスを返す。
 *
 * 使用フェーズ: Phase 0, Phase 2, Phase 3.5
 */
export class TavilyAdapter implements ResearchAdapter {
  name = 'Tavily';
  role = 'LLM-Optimized Search - Structured business data and verification';

  private readonly baseUrl = 'https://api.tavily.com/search';

  async isAvailable(): Promise<boolean> {
    return !!env.tavilyApiKey;
  }

  async search(query: string, caseType: CaseType): Promise<ResearchOutput | null> {
    try {
      if (!env.tavilyApiKey) return null;

      const enhancedQuery = this.enhanceQuery(query, caseType);
      const searchDepth = this.getSearchDepth(caseType);

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: env.tavilyApiKey,
          query: enhancedQuery,
          search_depth: searchDepth,
          max_results: 15,
          include_answer: true,
          include_raw_content: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Tavily API responded with ${response.status}: ${response.statusText}`);
      }

      const data = await response.json() as TavilySearchResponse;

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
        confidence: 0.8,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[${this.name}] Search failed: ${message}`);
      return null;
    }
  }

  /**
   * 案件タイプに応じた検索深度を決定
   * Phase 2の裏取り用途では深い検索を使用
   */
  private getSearchDepth(caseType: CaseType): 'basic' | 'advanced' {
    return caseType === 'D' ? 'advanced' : 'basic';
  }

  private enhanceQuery(query: string, caseType: CaseType): string {
    const suffixes: Record<CaseType, string> = {
      A: '市場データ 統計 業界レポート',
      B: '改善効果 定量データ コスト削減',
      C: 'DX導入効果 生産性 デジタル化統計',
      D: 'リスク統計 被害額 対策コスト',
    };
    return `${query} ${suffixes[caseType]}`;
  }

  private convertToFindings(data: TavilySearchResponse): Finding[] {
    const findings: Finding[] = [];

    if (data.answer) {
      findings.push({
        category: 'ai_summary',
        summary: 'Tavily AI要約',
        details: data.answer,
        evidence: data.results.slice(0, 3).map((r) => r.url),
        confidence: 0.85,
      });
    }

    for (const result of data.results.slice(0, 10)) {
      findings.push({
        category: 'structured_search',
        summary: result.title,
        details: result.content.slice(0, 500),
        evidence: [result.url],
        confidence: Math.min(result.score, 1),
      });
    }

    return findings;
  }

  private convertToDataPoints(data: TavilySearchResponse): DataPoint[] {
    return data.results
      .filter((r) => this.containsNumericData(r.content))
      .slice(0, 8)
      .map((result) => ({
        metric: result.title,
        value: this.extractNumericValue(result.content),
        unit: '',
        source: result.url,
        date: result.published_date ?? '',
      }));
  }

  private convertToSources(data: TavilySearchResponse): Source[] {
    return data.results.map((result) => ({
      url: result.url,
      title: result.title,
      date: result.published_date ?? '',
      reliability: result.score > 0.8 ? 'high' as const : 'medium' as const,
    }));
  }

  private identifyGaps(data: TavilySearchResponse): string[] {
    const gaps: string[] = [];
    if (data.results.length < 5) {
      gaps.push('構造化検索の結果が少数');
    }
    if (!data.answer) {
      gaps.push('AI要約が生成されなかったため、情報の統合度が低い');
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
