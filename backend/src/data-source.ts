import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as path from 'path';
import { User, Task } from './entities';

export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: process.env['DB_PATH'] ?? './tasks.db',
  entities: [User, Task],
  migrations: [path.join(__dirname, 'migrations', '*.{ts,js}')],
  synchronize: false,
  logging: process.env['NODE_ENV'] !== 'production',
});
