import dotenv from 'dotenv';
import path from 'path';

// Carrega .env da raiz ou local
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3333', 10),
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || 'super-secret-refresh-key-change-in-production',
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  CRON_SCHEDULE: process.env.CRON_SCHEDULE || '0 */2 * * *',
  PNCP_API_BASE_URL: process.env.PNCP_API_BASE_URL || 'https://pncp.gov.br/api/consulta/v1',
};
