/**
 * YAML設定ファイルローダー
 *
 * config/services/*.yaml を読み込み、AIServiceConfig型に変換。
 * 設定駆動アーキテクチャの起点。
 */

import fs from 'fs';
import path from 'path';
import YAML from 'yaml';
import type { AIServiceConfig, AIServiceName } from '../types';
import { logger } from './logger';

const CONFIG_DIR = path.resolve(process.cwd(), 'config', 'services');

/** 単一サービスの設定を読み込む */
export function loadServiceConfig(serviceName: AIServiceName): AIServiceConfig {
  const configPath = path.join(CONFIG_DIR, `${serviceName}.yaml`);

  if (!fs.existsSync(configPath)) {
    throw new Error(`Configuration file not found: ${configPath}`);
  }

  const raw = fs.readFileSync(configPath, 'utf-8');
  const config = YAML.parse(raw) as AIServiceConfig;

  validateConfig(config, serviceName);

  logger.info(`Loaded configuration for ${serviceName}`, {
    service: serviceName,
    steps: config.operation_steps.length,
    selectors: Object.keys(config.selectors).length,
  });

  return config;
}

/** 全サービスの設定を一括読み込み */
export function loadAllServiceConfigs(): Map<AIServiceName, AIServiceConfig> {
  const configs = new Map<AIServiceName, AIServiceConfig>();
  const serviceNames: AIServiceName[] = ['chatgpt', 'gemini', 'grok', 'perplexity'];

  for (const name of serviceNames) {
    try {
      configs.set(name, loadServiceConfig(name));
    } catch (err) {
      logger.warn(`Failed to load config for ${name}: ${(err as Error).message}`);
    }
  }

  return configs;
}

/** 設定ファイルの基本バリデーション */
function validateConfig(config: AIServiceConfig, serviceName: AIServiceName): void {
  const errors: string[] = [];

  if (config.service_name !== serviceName) {
    errors.push(`service_name mismatch: expected ${serviceName}, got ${config.service_name}`);
  }

  if (!config.base_url) {
    errors.push('base_url is required');
  }

  if (!config.auth?.storage_state_path) {
    errors.push('auth.storage_state_path is required');
  }

  if (!config.operation_steps || config.operation_steps.length === 0) {
    errors.push('operation_steps must have at least one step');
  }

  if (!config.completion_detection?.layers || config.completion_detection.layers.length === 0) {
    errors.push('completion_detection.layers must have at least one layer');
  }

  if (errors.length > 0) {
    throw new Error(
      `Configuration validation failed for ${serviceName}:\n${errors.join('\n')}`
    );
  }
}

/** 設定ファイルの存在チェック（起動時の事前検証用） */
export function checkConfigAvailability(): Record<AIServiceName, boolean> {
  const serviceNames: AIServiceName[] = ['chatgpt', 'gemini', 'grok', 'perplexity'];
  const result: Record<string, boolean> = {};

  for (const name of serviceNames) {
    const configPath = path.join(CONFIG_DIR, `${name}.yaml`);
    result[name] = fs.existsSync(configPath);
  }

  return result as Record<AIServiceName, boolean>;
}
