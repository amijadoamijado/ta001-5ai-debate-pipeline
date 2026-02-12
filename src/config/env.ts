/**
 * 環境変数の一元管理
 * リサーチAPI群のキーと設定を提供する
 */
export interface EnvConfig {
  /** Brave Search API key */
  braveApiKey: string | undefined;
  /** Tavily Search API key */
  tavilyApiKey: string | undefined;
  /** Exa Search API key */
  exaApiKey: string | undefined;
  /** Perplexity API key */
  perplexityApiKey: string | undefined;
  /** Grok (xAI) API key */
  grokApiKey: string | undefined;
}

/** 環境変数から読み込んだ設定 */
export const env: EnvConfig = {
  braveApiKey: process.env['BRAVE_API_KEY'],
  tavilyApiKey: process.env['TAVILY_API_KEY'],
  exaApiKey: process.env['EXA_API_KEY'],
  perplexityApiKey: process.env['PERPLEXITY_API_KEY'],
  grokApiKey: process.env['GROK_API_KEY'],
};
