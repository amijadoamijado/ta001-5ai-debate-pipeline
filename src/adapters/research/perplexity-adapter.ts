import { ResearchAdapter, CaseType } from './types.js';
import { ResearchOutput, Finding, DataPoint, Source } from '../../pipeline/types/index.js';
import { env } from '../../config/env.js';

/** Perplexity APIのレスポンス型 */
interface PerplexityChoice {
  message: {
    role: string;
    content: string;
  };
}

interface PerplexityCitation {
  url: string;
  title?: string;
}

interface PerplexityResponse {
  choices: PerplexityChoice[];
  citations?: (string | PerplexityCitation)[];
}

/**
 * Perplexity API Adapter
 *
 * ファクトチェック・情報検証に特化。引用付きの回答を生成し、
 * 他AIの主張を裏付け・反証するための根拠を提供する。
 * Online検索モデル（sonar系）を使用。
 *
 * 使用フェーズ: Phase 0（検証役）
 */
export class PerplexityAdapter implements ResearchAdapter {
  name = 'Perplexity';
  role = 'Fact-checking and source verification with citations';

  private readonly baseUrl = 'https://api.perplexity.ai/chat/completions';

  async isAvailable(): Promise<boolean> {
    return !!env.perplexityApiKey;
  }

  async search(query: string, caseType: CaseType): Promise<ResearchOutput | null> {
    try {
      if (!env.perplexityApiKey) return null;

      const systemPrompt = this.buildSystemPrompt(caseType);

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.perplexityApiKey}`,
        },
        body: JSON.stringify({
          model: 'sonar',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: query },
          ],
          max_tokens: 4000,
          return_citations: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Perplexity API responded with ${response.status}: ${response.statusText}`);
      }

      const data = await response.json() as PerplexityResponse;
      const content = data.choices[0]?.message.content ?? '';
      const citations = data.citations ?? [];

      return {
        ai_name: this.name,
        role: this.role,
        query,
        timestamp: new Date().toISOString(),
        findings: this.convertToFindings(content, citations),
        data_points: this.extractDataPoints(content, citations),
        trends: [],
        risks: [],
        gaps: this.identifyGaps(content, citations),
        sources: this.convertToSources(citations),
        confidence: 0.85,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[${this.name}] Search failed: ${message}`);
      return null;
    }
  }

  private buildSystemPrompt(caseType: CaseType): string {
    const contexts: Record<CaseType, string> = {
      A: '新規事業・新規サービスに関する市場調査と検証を行ってください。',
      B: '既存事業の改善に関するデータと事例を調査してください。',
      C: 'DX・デジタル変革に関する最新情報と導入効果を調査してください。',
      D: 'リスク・危機に関する統計データと対策事例を調査してください。',
    };

    return [
      'あなたはファクトチェック専門の調査員です。',
      contexts[caseType],
      '回答には必ず引用元を明記し、数値データがあれば正確に引用してください。',
      '不確実な情報には「未確認」と明記してください。',
    ].join('\n');
  }

  private convertToFindings(
    content: string,
    citations: (string | PerplexityCitation)[],
  ): Finding[] {
    const paragraphs = content.split('\n\n').filter((p) => p.trim().length > 0);
    const citationUrls = this.extractCitationUrls(citations);

    return paragraphs.slice(0, 8).map((paragraph, index) => ({
      category: 'fact_check',
      summary: paragraph.slice(0, 100),
      details: paragraph,
      evidence: citationUrls.slice(index, index + 2),
      confidence: 0.85,
    }));
  }

  private extractDataPoints(
    content: string,
    citations: (string | PerplexityCitation)[],
  ): DataPoint[] {
    const dataPoints: DataPoint[] = [];
    const citationUrls = this.extractCitationUrls(citations);
    const lines = content.split('\n');

    for (const line of lines) {
      if (this.containsNumericData(line)) {
        dataPoints.push({
          metric: line.slice(0, 80),
          value: this.extractNumericValue(line),
          unit: '',
          source: citationUrls[0] ?? 'perplexity',
          date: new Date().toISOString().split('T')[0] ?? '',
        });
      }
      if (dataPoints.length >= 5) break;
    }

    return dataPoints;
  }

  private convertToSources(citations: (string | PerplexityCitation)[]): Source[] {
    return citations.map((citation) => {
      if (typeof citation === 'string') {
        return {
          url: citation,
          title: '',
          date: '',
          reliability: 'high' as const,
        };
      }
      return {
        url: citation.url,
        title: citation.title ?? '',
        date: '',
        reliability: 'high' as const,
      };
    });
  }

  private extractCitationUrls(citations: (string | PerplexityCitation)[]): string[] {
    return citations.map((c) => (typeof c === 'string' ? c : c.url));
  }

  private identifyGaps(
    content: string,
    citations: (string | PerplexityCitation)[],
  ): string[] {
    const gaps: string[] = [];
    if (citations.length < 3) {
      gaps.push('引用元が少数のため、検証の多角性に限界');
    }
    if (content.includes('未確認') || content.includes('不明')) {
      gaps.push('一部情報が未確認のため追加調査推奨');
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
