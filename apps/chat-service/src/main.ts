import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: `${process.env.FE_URL}`,
    methods: 'GET,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(process.env.PORT!);
  console.log(
    `chat service running on: http://localhost:${process.env.PORT ?? 3004}`,
  );
}
bootstrap();
