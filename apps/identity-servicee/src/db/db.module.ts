import { Module } from '@nestjs/common';
import { DB_PROVIDER } from './db.provider';
import { SeedService } from './seed';
import { getDb } from '@repo/db';
@Module({
  providers: [
    {
      provide: DB_PROVIDER,
      useFactory: async () => await getDb(),
    },
    SeedService,
  ],
  exports: [DB_PROVIDER],
})
export class DbModule {}