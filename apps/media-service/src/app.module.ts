import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QueueModule } from './queue/queue.module';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from './db/db.module';
import { MiniOModule } from './minio/minio.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    QueueModule,
    DbModule, 
    MiniOModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
