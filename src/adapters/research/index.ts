/**
 * Research Adapter Layer - Barrel Export
 *
 * 5つのリサーチAPIアダプターと共通型をエクスポート。
 * Adapter-Coreパターンに基づき、各APIの差異を吸収し
 * 標準形式（ResearchOutput）に変換する。
 */
export { BraveAdapter } from './brave-adapter.js';
export { ExaAdapter } from './exa-adapter.js';
export { TavilyAdapter } from './tavily-adapter.js';
export { PerplexityAdapter } from './perplexity-adapter.js';
export { GrokAdapter } from './grok-adapter.js';
export type { ResearchAdapter, CaseType, StorageAdapter } from './types.js';
