import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import databaseConfig from './config/database.config';
import { DatabaseService } from './services/database.service';

@Global()
@Module({
    imports: [ConfigModule.forFeature(databaseConfig)],
    providers: [DatabaseService],
    exports: [DatabaseService],
})
export class DatabaseModule {}
