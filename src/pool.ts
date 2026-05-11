import { attachDatabasePool } from '@vercel/functions';
import dotenv from 'dotenv';
import type { PoolOptions } from 'mysql2';
import { createPool } from 'mysql2';

dotenv.config();

const DEFAULT_CONNECTION_LIMIT = 100;

if (!process.env.DB_USERNAME) {
  throw Error('DB_USERNAME not found');
}

if (!process.env.DB_PASSWORD) {
  throw Error('DB_PASSWORD not found');
}

if (!process.env.DB_DATABASE) {
  throw Error('DB_DATABASE not found');
}

const options: PoolOptions = {
  charset: process.env.DB_CHARSET ?? 'utf8mb4',
  connectionLimit: typeof process.env.DB_CONNECTION_LIMIT === 'undefined' ? DEFAULT_CONNECTION_LIMIT : parseInt(process.env.DB_CONNECTION_LIMIT, 10),
  database: process.env.DB_DATABASE,
  debug: process.env.DB_DEBUG === 'TRUE',
  password: process.env.DB_PASSWORD,
  user: process.env.DB_USERNAME,
  decimalNumbers: true,
};

if (typeof process.env.DB_SOCKET_PATH !== 'undefined') {
  options.socketPath = process.env.DB_SOCKET_PATH;
} else if (typeof process.env.DB_HOST !== 'undefined') {
  options.host = process.env.DB_HOST;
}

if (process.env.DB_SSL === 'true') {
  options.ssl = {};
  if (typeof process.env.DB_CLIENT_CERT !== 'undefined') {
    options.ssl.cert = Buffer.from(process.env.DB_CLIENT_CERT, 'base64').toString('utf8');
  }
  if (typeof process.env.DB_CLIENT_KEY !== 'undefined') {
    options.ssl.key = Buffer.from(process.env.DB_CLIENT_KEY, 'base64').toString('utf8');
  }
  if (typeof process.env.DB_SERVER_CA !== 'undefined') {
    options.ssl.ca = Buffer.from(process.env.DB_SERVER_CA, 'base64').toString('utf8');
  }
}
const rawPool = createPool(options);
attachDatabasePool(rawPool);

export const pool = rawPool.promise();
