import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { ConfigModule } from '@nestjs/config';
import { QueueModule } from './queue/queue.module';
import { RedisModule } from './redis/redis.module';
import { JwtModule } from '@nestjs/jwt';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DbModule,
    QueueModule,
    RedisModule,
    JwtModule.register({
      secret:process.env.ACCESS_TOKEN,
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
