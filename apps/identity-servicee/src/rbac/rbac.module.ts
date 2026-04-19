import { Module } from '@nestjs/common';
import { RbacController } from './rbac.controller';
import { RbacService } from './rbac.service';
import { DbModule } from 'src/db/db.module';
@Module({
  controllers: [RbacController],
  providers: [RbacService],
  imports: [DbModule],
})
export class RbacModule {}
