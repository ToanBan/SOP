import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RedisIoAdapter } from './gateway/RedisIoAdapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);
  await app.listen(process.env.PORT ?? 4000);
  console.log(process.env.PORT)
}
bootstrap();
