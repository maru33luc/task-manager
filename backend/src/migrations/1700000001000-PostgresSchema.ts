import { MigrationInterface, QueryRunner } from 'typeorm';

export class PostgresSchema1700000001000 implements MigrationInterface {
  name = 'PostgresSchema1700000001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // This migration targets PostgreSQL only. On SQLite the sibling
    // InitialSchema migration handles the initial schema instead.
    if (queryRunner.connection.options.type !== 'postgres') return;

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id"           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
        "email"        varchar     NOT NULL UNIQUE,
        "password"     varchar     NOT NULL,
        "name"         varchar     NOT NULL,
        "refreshToken" varchar,
        "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "tasks" (
        "id"          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
        "title"       varchar     NOT NULL,
        "description" varchar,
        "status"      varchar     NOT NULL DEFAULT 'todo',
        "priority"    varchar     NOT NULL DEFAULT 'medium',
        "dueDate"     varchar,
        "userId"      uuid        NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_tasks_userId"   ON "tasks" ("userId")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_tasks_status"   ON "tasks" ("status")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_tasks_priority" ON "tasks" ("priority")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'postgres') return;
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_tasks_priority"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_tasks_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_tasks_userId"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tasks"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
  }
}
