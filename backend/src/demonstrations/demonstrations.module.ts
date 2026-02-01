import { Module } from '@nestjs/common';
import { DemonstrationsService } from './demonstrations.service';
import { DemonstrationsController } from './demonstrations.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [DemonstrationsService],
  controllers: [DemonstrationsController],
})
export class DemonstrationsModule {}
