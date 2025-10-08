#!/usr/bin/env node
import { config } from 'dotenv';
config();

import {
  FileMigrationProvider,
  Kysely,
  Migrator,
  PostgresDialect,
} from 'kysely';
import { Pool } from 'pg';
import * as path from 'path';
import { promises as fs } from 'fs';

async function createMigrator() {
  const db = new Kysely({
    dialect: new PostgresDialect({
      pool: new Pool({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432', 10),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      }),
    }),
  });

  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(__dirname, '../migrations'),
    }),
  });

  return { db, migrator };
}

async function migrateToLatest() {
  console.log('🚀 Running migrations...\n');

  const { db, migrator } = await createMigrator();

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((it) => {
    if (it.status === 'Success') {
      console.log(
        `✅ Migration "${it.migrationName}" was executed successfully`
      );
    } else if (it.status === 'Error') {
      console.error(`❌ Failed to execute migration "${it.migrationName}"`);
    }
  });

  if (error) {
    console.error('❌ Failed to migrate');
    console.error(error);
    await db.destroy();
    process.exit(1);
  }

  await db.destroy();
  console.log('\n✅ All migrations completed successfully!');
  process.exit(0);
}

async function migrateDown() {
  console.log('⏪ Rolling back last migration...\n');

  const { db, migrator } = await createMigrator();

  const { error, results } = await migrator.migrateDown();

  results?.forEach((it) => {
    if (it.status === 'Success') {
      console.log(
        `✅ Migration "${it.migrationName}" was rolled back successfully`
      );
    } else if (it.status === 'Error') {
      console.error(`❌ Failed to rollback migration "${it.migrationName}"`);
    }
  });

  if (error) {
    console.error('❌ Failed to rollback');
    console.error(error);
    await db.destroy();
    process.exit(1);
  }

  await db.destroy();
  console.log('\n✅ Rollback completed successfully!');
  process.exit(0);
}

async function migrationStatus() {
  console.log('📋 Checking migration status...\n');

  const { db, migrator } = await createMigrator();

  const migrations = await migrator.getMigrations();

  if (migrations.length === 0) {
    console.log('No migrations found');
  } else {
    migrations.forEach((migration) => {
      const status = migration.executedAt
        ? `✅ Executed at ${migration.executedAt.toISOString()}`
        : '⏳ Pending';
      console.log(`${status} - ${migration.name}`);
    });
  }

  await db.destroy();
  process.exit(0);
}

async function createMigration() {
  const migrationName = process.argv[3];

  if (!migrationName) {
    console.error('❌ Please provide a migration name');
    console.log('Usage: npm run db:migration:create <migration-name>');
    process.exit(1);
  }

  const timestamp = new Date().getTime();
  const fileName = `${timestamp}_${migrationName}.ts`;
  const filePath = `libs/database/src/migrations/${fileName}`;

  const template = `import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Write your migration here
}

export async function down(db: Kysely<any>): Promise<void> {
  // Write your rollback here
}
`;

  const fs = require('fs');
  fs.writeFileSync(filePath, template);

  console.log(`✅ Created migration: ${fileName}`);
  process.exit(0);
}

// Parse command line arguments
const command = process.argv[2];

switch (command) {
  case 'up':
    migrateToLatest();
    break;
  case 'down':
    migrateDown();
    break;
  case 'status':
    migrationStatus();
    break;
  case 'create':
    createMigration();
    break;
  default:
    console.log('Usage:');
    console.log('  npm run db:migrate:up     - Run all pending migrations');
    console.log('  npm run db:migrate:down   - Rollback last migration');
    console.log('  npm run db:migrate:status - Check migration status');
    console.log('  npm run db:migrate:create <name> - Create new migration');
    process.exit(1);
}
