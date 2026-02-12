import { ResearchAdapter, CaseType } from './types.js';
import { ResearchOutput, Finding, DataPoint, Source } from '../../pipeline/types/index.js';
import { env } from '../../config/env.js';

/** xAI (Grok) APIのレスポンス型 */
interface GrokChoice {
  message: {
    role: string;
    content: string;
  };
}

interface GrokResponse {
  choices: GrokChoice[];
}

/**
 * Grok (xAI) API Adapter
 *
 * Xプラットフォームのリアルタイムデータとソーシャル感情分析に特化。
 * トレンド分析・世論の温度感・SNSでの反応パターンを提供する。
 *
 * 使用フェーズ: Phase 0（感情データ参考情報）
 */
export class GrokAdapter implements ResearchAdapter {
  name = 'Grok';
  role = 'Social intelligence - Real-time trends and sentiment analysis';

  private readonly baseUrl = 'https://api.x.ai/v1/chat/completions';

  async isAvailable(): Promise<boolean> {
    return !!env.grokApiKey;
  }

  async search(query: string, caseType: CaseType): Promise<ResearchOutput | null> {
    try {
      if (!env.grokApiKey) return null;

      const systemPrompt = this.buildSystemPrompt(caseType);

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.grokApiKey}`,
        },
        body: JSON.stringify({
          model: 'grok-3',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: query },
          ],
          max_tokens: 4000,
        }),
      });

      if (!response.ok) {
        throw new Error(`Grok API responded with ${response.status}: ${response.statusText}`);
      }

      const data = await response.json() as GrokResponse;
      const content = data.choices[0]?.message.content ?? '';

      return {
        ai_name: this.name,
        role: this.role,
        query,
        timestamp: new Date().toISOString(),
        findings: this.convertToFindings(content),
        data_points: this.extractDataPoints(content),
        trends: [],
        risks: [],
        gaps: this.identifyGaps(content),
        sources: this.buildSources(),
        confidence: 0.65,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[${this.name}] Search failed: ${message}`);
      return null;
    }
  }

  private buildSystemPrompt(caseType: CaseType): string {
    const contexts: Record<CaseType, string> = {
      A: '新規事業・新サービスに関するXプラットフォーム上のトレンドと世論を分析してください。',
      B: '業務改善・効率化に関する最新のSNSトレンドと企業の反応を分析してください。',
      C: 'DX・デジタル変革に関するX上の議論と業界トレンドを分析してください。',
      D: 'リスク・危機に関するSNS上の反応パターンと世論の動向を分析してください。',
    };

    return [
      'あなたはソーシャルインテリジェンス分析の専門家です。',
      'Xプラットフォームやソーシャルメディアのトレンドとセンチメントを分析します。',
      contexts[caseType],
      '',
      '分析フォーマット:',
      '1. トレンド概要（箇条書き）',
      '2. センチメント分析（ポジティブ/ネガティブ/中立の割合推定）',
      '3. 主要な意見・懸念点',
      '4. 数値データがあれば具体的に記載',
    ].join('\n');
  }

  private convertToFindings(content: string): Finding[] {
    const paragraphs = content.split('\n\n').filter((p) => p.trim().length > 0);

    return paragraphs.slice(0, 8).map((paragraph) => ({
      category: 'social_intelligence',
      summary: paragraph.slice(0, 100),
      details: paragraph,
      evidence: ['xai-grok-analysis'],
      confidence: 0.65,
    }));
  }

  private extractDataPoints(content: string): DataPoint[] {
    const dataPoints: DataPoint[] = [];
    const lines = content.split('\n');

    for (const line of lines) {
      if (this.containsNumericData(line)) {
        dataPoints.push({
          metric: line.slice(0, 80),
          value: this.extractNumericValue(line),
          unit: '',
          source: 'grok-analysis',
          date: new Date().toISOString().split('T')[0] ?? '',
        });
      }
      if (dataPoints.length >= 5) break;
    }

    return dataPoints;
  }

  /**
   * Grokは引用URLを返さないため、分析元としてXプラットフォームを記録
   */
  private buildSources(): Source[] {
    return [
      {
        url: 'https://x.com',
        title: 'X Platform - Social Intelligence Analysis via Grok',
        date: new Date().toISOString().split('T')[0] ?? '',
        reliability: 'medium',
      },
    ];
  }

  private identifyGaps(content: string): string[] {
    const gaps: string[] = [];
    if (content.length < 200) {
      gaps.push('Grokの分析出力が短く、十分な分析深度に達していない可能性');
    }
    gaps.push('ソーシャルデータは主観的意見が含まれるため、ファクトチェックが必要');
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
