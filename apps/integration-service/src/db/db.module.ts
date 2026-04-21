import { Module } from '@nestjs/common';
import { DB_PROVIDER } from './db.provider';
import { getDb } from '@repo/db';
@Module({
  providers: [
    {
      provide: DB_PROVIDER,
      useFactory: async () => await getDb(),
    },
  ],
  exports: [DB_PROVIDER],
})
export class DbModule {}