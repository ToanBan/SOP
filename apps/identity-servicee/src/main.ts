import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SeedService } from "./db/seed";
import cookieParser from 'cookie-parser';
async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.use(cookieParser());

    app.enableCors({
        origin: `${process.env.FE_URL}`, 
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });

    const seedService = app.get(SeedService);
    await seedService.onModuleInit();

    const port = process.env.PORT ?? 3003;
    await app.listen(port);
    
    console.log(`Identity service running on: http://localhost:${port}`);
}
bootstrap();