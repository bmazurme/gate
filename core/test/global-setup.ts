import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve } from 'path';

const TEST_DB_NAME = 'gate_test';

export default async function globalSetup(): Promise<void> {
  config({ path: resolve(__dirname, '../.env') });

  const client = new Client({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: 'postgres',
  });

  await client.connect();
  await client.query(
    `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()`,
    [TEST_DB_NAME],
  );
  await client.query(`DROP DATABASE IF EXISTS "${TEST_DB_NAME}"`);
  await client.query(`CREATE DATABASE "${TEST_DB_NAME}"`);
  await client.end();
}
