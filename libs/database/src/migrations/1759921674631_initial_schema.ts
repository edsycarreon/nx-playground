import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Enable UUID extension
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`.execute(db);

  // Create trigger function FIRST (before creating tables)
  await sql`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ language 'plpgsql';
  `.execute(db);

  // Create person table
  await db.schema
    .createTable('person')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`uuid_generate_v4()`)
    )
    .addColumn('email', 'varchar(255)', (col) => col.unique().notNull())
    .addColumn('password_hash', 'varchar(255)', (col) => col.notNull())
    .addColumn('first_name', 'varchar(100)')
    .addColumn('last_name', 'varchar(100)')
    .addColumn('avatar_url', 'text')
    .addColumn('email_verified', 'boolean', (col) =>
      col.defaultTo(false).notNull()
    )
    .addColumn('is_active', 'boolean', (col) => col.defaultTo(true).notNull())
    .addColumn('is_2fa_enabled', 'boolean', (col) =>
      col.defaultTo(false).notNull()
    )
    .addColumn('two_fa_secret', 'varchar(255)')
    .addColumn('failed_login_attempts', 'integer', (col) =>
      col.defaultTo(0).notNull()
    )
    .addColumn('locked_until', 'timestamptz')
    .addColumn('last_login_at', 'timestamptz')
    .addColumn('created_at', 'timestamptz', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .addColumn('updated_at', 'timestamptz')
    .addColumn('deleted_at', 'timestamptz')
    .execute();

  await db.schema
    .createIndex('idx_person_email')
    .on('person')
    .column('email')
    .execute();

  // Create refresh_token table
  await db.schema
    .createTable('refresh_token')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`uuid_generate_v4()`)
    )
    .addColumn('person_id', 'uuid', (col) =>
      col.references('person.id').onDelete('cascade').notNull()
    )
    .addColumn('token_hash', 'varchar(255)', (col) => col.notNull().unique())
    .addColumn('expires_at', 'timestamptz', (col) => col.notNull())
    .addColumn('device_name', 'varchar(255)')
    .addColumn('device_type', 'varchar(50)')
    .addColumn('ip_address', 'varchar(45)')
    .addColumn('user_agent', 'text')
    .addColumn('is_revoked', 'boolean', (col) => col.defaultTo(false).notNull())
    .addColumn('revoked_at', 'timestamptz')
    .addColumn('last_used_at', 'timestamptz')
    .addColumn('created_at', 'timestamptz', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .addColumn('updated_at', 'timestamptz')
    .execute();

  // Create indexes for refresh_token
  await db.schema
    .createIndex('idx_refresh_token_person_id')
    .on('refresh_token')
    .column('person_id')
    .execute();

  await db.schema
    .createIndex('idx_refresh_token_expires_at')
    .on('refresh_token')
    .column('expires_at')
    .execute();

  // Create password_reset_token table
  await db.schema
    .createTable('password_reset_token')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`uuid_generate_v4()`)
    )
    .addColumn('person_id', 'uuid', (col) =>
      col.references('person.id').onDelete('cascade').notNull()
    )
    .addColumn('token_hash', 'varchar(255)', (col) => col.notNull().unique())
    .addColumn('expires_at', 'timestamptz', (col) => col.notNull())
    .addColumn('used', 'boolean', (col) => col.defaultTo(false).notNull())
    .addColumn('used_at', 'timestamptz')
    .addColumn('created_at', 'timestamptz', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .addColumn('updated_at', 'timestamptz')
    .execute();

  // Create email_verification_token table
  await db.schema
    .createTable('email_verification_token')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`uuid_generate_v4()`)
    )
    .addColumn('person_id', 'uuid', (col) =>
      col.references('person.id').onDelete('cascade').notNull()
    )
    .addColumn('token_hash', 'varchar(255)', (col) => col.notNull().unique())
    .addColumn('expires_at', 'timestamptz', (col) => col.notNull())
    .addColumn('verified', 'boolean', (col) => col.defaultTo(false).notNull())
    .addColumn('verified_at', 'timestamptz')
    .addColumn('created_at', 'timestamptz', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .addColumn('updated_at', 'timestamptz')
    .execute();

  // Create oauth_providers table
  await db.schema
    .createTable('oauth_provider')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`uuid_generate_v4()`)
    )
    .addColumn('person_id', 'uuid', (col) =>
      col.references('person.id').onDelete('cascade').notNull()
    )
    .addColumn('provider', 'varchar(50)', (col) => col.notNull())
    .addColumn('provider_user_id', 'varchar(255)', (col) => col.notNull())
    .addColumn('access_token', 'text')
    .addColumn('refresh_token', 'text')
    .addColumn('token_expires_at', 'timestamptz')
    .addColumn('created_at', 'timestamptz', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .addColumn('updated_at', 'timestamptz')
    .execute();

  // Create unique constraint for oauth providers
  await db.schema
    .createIndex('idx_oauth_provider_user')
    .on('oauth_provider')
    .columns(['provider', 'provider_user_id'])
    .unique()
    .execute();

  await db.schema
    .createIndex('idx_oauth_provider_person_id')
    .on('oauth_provider')
    .column('person_id')
    .execute();

  // Create password_history table
  await db.schema
    .createTable('password_history')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`uuid_generate_v4()`)
    )
    .addColumn('person_id', 'uuid', (col) =>
      col.references('person.id').onDelete('cascade').notNull()
    )
    .addColumn('password_hash', 'varchar(255)', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .addColumn('updated_at', 'timestamptz')
    .execute();

  // Create two_fa_backup_codes table
  await db.schema
    .createTable('two_fa_backup_code')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`uuid_generate_v4()`)
    )
    .addColumn('person_id', 'uuid', (col) =>
      col.references('person.id').onDelete('cascade').notNull()
    )
    .addColumn('code_hash', 'varchar(255)', (col) => col.notNull())
    .addColumn('used', 'boolean', (col) => col.defaultTo(false).notNull())
    .addColumn('used_at', 'timestamptz')
    .addColumn('created_at', 'timestamptz', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .addColumn('updated_at', 'timestamptz')
    .execute();

  // Create login_attempts table
  await db.schema
    .createTable('login_attempt')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`uuid_generate_v4()`)
    )
    .addColumn('email', 'varchar(255)', (col) => col.notNull())
    .addColumn('ip_address', 'varchar(45)', (col) => col.notNull())
    .addColumn('user_agent', 'text')
    .addColumn('success', 'boolean', (col) => col.notNull())
    .addColumn('failure_reason', 'text')
    .addColumn('attempted_at', 'timestamptz', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .execute();

  // Create indexes for login_attempts
  await db.schema
    .createIndex('idx_login_attempt_email_time')
    .on('login_attempt')
    .columns(['email', 'attempted_at'])
    .execute();

  await db.schema
    .createIndex('idx_login_attempt_ip_time')
    .on('login_attempt')
    .columns(['ip_address', 'attempted_at'])
    .execute();

  // Add trigger to users table
  await sql`
      CREATE TRIGGER update_person_updated_at
      BEFORE UPDATE ON person
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `.execute(db);

  // Add trigger to oauth_providers table
  await sql`
      CREATE TRIGGER update_oauth_provider_updated_at
      BEFORE UPDATE ON oauth_provider
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop tables in reverse order (respecting foreign keys)
  await db.schema.dropTable('login_attempt').ifExists().execute();
  await db.schema.dropTable('two_fa_backup_code').ifExists().execute();
  await db.schema.dropTable('password_history').ifExists().execute();
  await db.schema.dropTable('oauth_provider').ifExists().execute();
  await db.schema.dropTable('email_verification_token').ifExists().execute();
  await db.schema.dropTable('password_reset_token').ifExists().execute();
  await db.schema.dropTable('refresh_token').ifExists().execute();
  await db.schema.dropTable('person').ifExists().execute();

  // Drop trigger function
  await sql`DROP FUNCTION IF EXISTS update_updated_at_column CASCADE`.execute(
    db
  );
}
