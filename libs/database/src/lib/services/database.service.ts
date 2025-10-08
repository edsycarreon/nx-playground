import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { DB } from '../types/database.type';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private _db: Kysely<DB> | null = null;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const dialect = new PostgresDialect({
      pool: new Pool({
        host: this.configService.get<string>('database.host'),
        port: this.configService.get<number>('database.port'),
        database: this.configService.get<string>('database.database'),
        user: this.configService.get<string>('database.user'),
        password: this.configService.get<string>('database.password'),
      }),
    });

    this._db = new Kysely<DB>({
      dialect,
    });

    // Test connection
    try {
      await this._db.selectFrom('person').select('id').limit(1).execute();
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this._db) {
      await this._db.destroy();
      console.log('🔌 Database connection closed');
    }
  }

  get db(): Kysely<DB> {
    if (!this._db) {
      throw new Error('Database not initialized');
    }
    return this._db;
  }
}
