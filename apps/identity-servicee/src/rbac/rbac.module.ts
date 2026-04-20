import { Module } from '@nestjs/common';
import { RbacController } from './rbac.controller';
import { RbacService } from './rbac.service';
import { DbModule } from 'src/db/db.module';
import { AppService } from 'src/app.service';
@Module({
  controllers: [RbacController],
  providers: [RbacService, AppService],
  imports: [DbModule],
})
export class RbacModule {}
