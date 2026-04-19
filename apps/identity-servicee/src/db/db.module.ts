import { Module } from "@nestjs/common";
import { dbProvider } from "./db.provider";
import { SeedService } from "./seed";

@Module({
	providers: [dbProvider, SeedService],
	exports: [dbProvider, SeedService],
})
export class DbModule {}
