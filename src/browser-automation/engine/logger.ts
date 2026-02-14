/**
 * ブラウザ自動化用ロガー
 *
 * Winston ベースのログ管理。ファイル + コンソール二重出力。
 * セレクタフォールバック発動・エラー・完了をすべて記録。
 */

import winston from 'winston';
import path from 'path';
import fs from 'fs';

const LOG_DIR = path.resolve(process.cwd(), 'logs', 'browser-automation');

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

/** メインロガー */
export const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { module: 'browser-automation' },
  transports: [
    new winston.transports.File({
      filename: path.join(LOG_DIR, `automation-${timestamp}.log`),
      level: 'debug',
    }),
    new winston.transports.File({
      filename: path.join(LOG_DIR, `error-${timestamp}.log`),
      level: 'error',
    }),
    new winston.transports.Console({
      level: 'info',
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp: ts, service: svc }) => {
          const prefix = svc ? `[${svc}]` : '';
          return `${ts} ${level}: ${prefix} ${message}`;
        })
      ),
    }),
  ],
});

/** サービス固有のchildロガーを生成 */
export function createServiceLogger(serviceName: string): winston.Logger {
  return logger.child({ service: serviceName });
}
