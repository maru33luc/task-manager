import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // This migration targets SQLite only. On PostgreSQL the sibling
    // PostgresSchema migration handles the initial schema instead.
    if (queryRunner.connection.options.type !== 'better-sqlite3') return;

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" varchar PRIMARY KEY NOT NULL,
        "email" varchar NOT NULL UNIQUE,
        "password" varchar NOT NULL,
        "name" varchar NOT NULL,
        "refreshToken" varchar,
        "createdAt" datetime NOT NULL DEFAULT (datetime('now'))
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "tasks" (
        "id" varchar PRIMARY KEY NOT NULL,
        "title" varchar NOT NULL,
        "description" varchar,
        "status" varchar NOT NULL DEFAULT ('todo'),
        "priority" varchar NOT NULL DEFAULT ('medium'),
        "dueDate" varchar,
        "userId" varchar NOT NULL,
        "createdAt" datetime NOT NULL DEFAULT (datetime('now')),
        "updatedAt" datetime NOT NULL DEFAULT (datetime('now')),
        CONSTRAINT "FK_tasks_users" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_tasks_userId" ON "tasks" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_tasks_status" ON "tasks" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_tasks_priority" ON "tasks" ("priority")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'better-sqlite3') return;
    await queryRunner.query(`DROP INDEX "IDX_tasks_priority"`);
    await queryRunner.query(`DROP INDEX "IDX_tasks_status"`);
    await queryRunner.query(`DROP INDEX "IDX_tasks_userId"`);
    await queryRunner.query(`DROP TABLE "tasks"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
