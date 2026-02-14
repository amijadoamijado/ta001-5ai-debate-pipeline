/**
 * ブラウザAI自動化 - メインエントリポイント
 *
 * Phase 0: 5AI Deep Research のブラウザ自動操作を提供。
 * Playwright + CDP ハイブリッド構成。YAML設定駆動。
 *
 * 使用方法:
 *   npx ts-node src/browser-automation/index.ts --pipeline-id <ID> --prompt <prompt>
 *
 * 設定:
 *   config/services/*.yaml - 各AIサービスの操作レシピ
 *   .storage/*.json       - 認証セッション
 */

import { runPhase0Research, saveResults } from './orchestrator';
import { checkConfigAvailability, logger } from './engine';
import type { AIServiceName, OrchestratorOptions } from './types';

/** CLI引数をパース */
function parseArgs(): OrchestratorOptions {
  const args = process.argv.slice(2);
  const options: Partial<OrchestratorOptions> = {
    services: [],
    headless: false,
    parallel: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--pipeline-id':
        options.pipeline_id = args[++i];
        break;
      case '--prompt':
        options.prompt = args[++i];
        break;
      case '--services':
        options.services = args[++i].split(',') as AIServiceName[];
        break;
      case '--case-type':
        options.case_type = args[++i];
        break;
      case '--parallel':
        options.parallel = true;
        break;
      case '--headless':
        options.headless = true;
        break;
      case '--screenshot-dir':
        options.screenshot_dir = args[++i];
        break;
      case '--timeout':
        options.timeout_per_service_ms = parseInt(args[++i], 10);
        break;
    }
  }

  // デフォルト値
  if (!options.pipeline_id) {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    options.pipeline_id = `${dateStr}-001-research`;
  }

  if (!options.prompt) {
    logger.error('--prompt is required');
    process.exit(1);
  }

  if (options.services!.length === 0) {
    // 全サービスをデフォルトで使用
    options.services = ['perplexity', 'grok', 'chatgpt', 'gemini'] as AIServiceName[];
  }

  if (!options.case_type) {
    options.case_type = 'A';
  }

  return options as OrchestratorOptions;
}

/** メイン実行 */
async function main(): Promise<void> {
  logger.info('=== Browser AI Automation - Phase 0 Research ===');

  // 設定ファイル存在チェック
  const configAvailability = checkConfigAvailability();
  logger.info('Configuration availability:', configAvailability);

  const unavailable = Object.entries(configAvailability)
    .filter(([_, available]) => !available)
    .map(([name]) => name);

  if (unavailable.length > 0) {
    logger.warn(`Missing configurations: ${unavailable.join(', ')}`);
  }

  // CLI引数パース
  const options = parseArgs();

  logger.info('Execution options:', {
    pipeline_id: options.pipeline_id,
    services: options.services,
    parallel: options.parallel,
    headless: options.headless,
  });

  // 実行
  const result = await runPhase0Research(options);

  // 結果保存
  const outputDir = `.kiro/ai-coordination/workflow/research/${options.pipeline_id}`;
  const { jsonPath, mdPath } = await saveResults(result, outputDir);

  // サマリー出力
  logger.info('=== Execution Complete ===');
  logger.info(`Results: ${result.summary.succeeded}/${result.summary.total} succeeded`);
  logger.info(`JSON: ${jsonPath}`);
  logger.info(`Markdown: ${mdPath}`);

  if (result.summary.failed > 0) {
    logger.warn(`${result.summary.failed} service(s) failed`);
    for (const [service, opResult] of Object.entries(result.results)) {
      if (!opResult.success) {
        logger.warn(`  - ${service}: ${opResult.error}`);
      }
    }
  }

  // セレクタフォールバック警告
  for (const [service, opResult] of Object.entries(result.results)) {
    const fallbacks = opResult.selector_usage.filter((s) => s.is_fallback);
    if (fallbacks.length > 0) {
      logger.warn(`Selector fallbacks detected for ${service}:`);
      for (const fb of fallbacks) {
        logger.warn(`  - ${fb.element_name}: level ${fb.fallback_level}`);
      }
    }
  }

  // 終了コード
  process.exit(result.summary.failed === result.summary.total ? 1 : 0);
}

// エクスポート（ライブラリとしても使用可能）
export { runPhase0Research, saveResults } from './orchestrator';
export type {
  AIServiceName,
  OrchestratorOptions,
  OrchestratorResult,
  OperationResult,
} from './types';

// CLI実行時のエントリポイント
if (require.main === module) {
  main().catch((err) => {
    logger.error(`Fatal error: ${(err as Error).message}`);
    process.exit(1);
  });
}
