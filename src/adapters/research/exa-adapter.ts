import { ResearchAdapter, CaseType } from './types.js';
import { ResearchOutput, Finding, DataPoint, Source } from '../../pipeline/types/index.js';
import { env } from '../../config/env.js';

/** Exa Search APIのレスポンス型 */
interface ExaResult {
  title: string;
  url: string;
  text: string;
  publishedDate?: string;
  author?: string;
  score: number;
}

interface ExaSearchResponse {
  results: ExaResult[];
  autopromptString?: string;
}

/**
 * Exa Search API Adapter
 *
 * セマンティック検索に特化。意味ベースで類似パターンや
 * 関連コンテンツを発見する。従来のキーワード検索では
 * 見つからない関連情報の発掘に強い。
 *
 * 使用フェーズ: Phase 3, Phase 3.5
 */
export class ExaAdapter implements ResearchAdapter {
  name = 'Exa';
  role = 'Semantic Search - Similar patterns and related content discovery';

  private readonly baseUrl = 'https://api.exa.ai/search';

  async isAvailable(): Promise<boolean> {
    return !!env.exaApiKey;
  }

  async search(query: string, caseType: CaseType): Promise<ResearchOutput | null> {
    try {
      if (!env.exaApiKey) return null;

      const enhancedQuery = this.enhanceQuery(query, caseType);

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.exaApiKey,
        },
        body: JSON.stringify({
          query: enhancedQuery,
          numResults: 15,
          useAutoprompt: true,
          type: 'auto',
          contents: {
            text: { maxCharacters: 2000 },
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Exa API responded with ${response.status}: ${response.statusText}`);
      }

      const data = await response.json() as ExaSearchResponse;

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
        confidence: 0.75,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[${this.name}] Search failed: ${message}`);
      return null;
    }
  }

  private enhanceQuery(query: string, caseType: CaseType): string {
    const prefixes: Record<CaseType, string> = {
      A: 'Companies that successfully launched similar initiatives to:',
      B: 'Case studies of operational improvement similar to:',
      C: 'Digital transformation success stories related to:',
      D: 'Crisis management and recovery examples for:',
    };
    return `${prefixes[caseType]} ${query}`;
  }

  private convertToFindings(data: ExaSearchResponse): Finding[] {
    return data.results.slice(0, 10).map((result) => ({
      category: 'semantic_search',
      summary: result.title,
      details: result.text.slice(0, 500),
      evidence: [result.url],
      confidence: Math.min(result.score, 1),
    }));
  }

  private convertToDataPoints(data: ExaSearchResponse): DataPoint[] {
    return data.results
      .filter((r) => this.containsNumericData(r.text))
      .slice(0, 5)
      .map((result) => ({
        metric: result.title,
        value: this.extractNumericValue(result.text),
        unit: '',
        source: result.url,
        date: result.publishedDate ?? '',
      }));
  }

  private convertToSources(data: ExaSearchResponse): Source[] {
    return data.results.map((result) => ({
      url: result.url,
      title: result.title,
      date: result.publishedDate ?? '',
      reliability: result.score > 0.8 ? 'high' as const : 'medium' as const,
    }));
  }

  private identifyGaps(data: ExaSearchResponse): string[] {
    const gaps: string[] = [];
    if (data.results.length < 5) {
      gaps.push('セマンティック検索の類似結果が少数');
    }
    const lowScoreCount = data.results.filter((r) => r.score < 0.5).length;
    if (lowScoreCount > data.results.length / 2) {
      gaps.push('類似度の高い結果が少なく、直接的な先行事例が限られる可能性');
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
