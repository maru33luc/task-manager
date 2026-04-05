import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as path from 'path';
import { User, Task } from './entities';

const isPostgres = !!process.env['DATABASE_URL'];
const isProduction = process.env['NODE_ENV'] === 'production';

const shared = {
  entities: [User, Task],
  migrations: [path.join(__dirname, 'migrations', '*.{ts,js}')],
  synchronize: false,
  logging: !isProduction,
};

const options: DataSourceOptions = isPostgres
  ? {
      ...shared,
      type: 'postgres',
      url: process.env['DATABASE_URL'],
      ssl: { rejectUnauthorized: false },
    }
  : {
      ...shared,
      type: 'better-sqlite3',
      database: process.env['DB_PATH'] ?? './tasks.db',
    };

export const AppDataSource = new DataSource(options);
