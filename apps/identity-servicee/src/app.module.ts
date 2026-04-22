import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '@nestjs-modules/ioredis';
import { GithubStrategy } from 'src/strategies/github.strategy';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from 'src/strategies/google.strategy';
import { RbacModule } from './rbac/rbac.module';
import { DbModule } from './db/db.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PassportModule,
    RedisModule.forRoot({
      type: 'single',
      url: 'redis://localhost:6379', 
    }),
    DbModule,
    JwtModule.register({
      global: true,
    }),
    RbacModule,
  ],
  controllers: [AppController],
  providers: [AppService, GithubStrategy, GoogleStrategy],
})
export class AppModule {}
