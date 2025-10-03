import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Unite, UniteSchema } from './schema/unite.schema';
import { UniteService } from './unite.service';
import { UniteController } from './unite.controller';
import { RolesGuard } from '../../auth/guards/roles.guard';

@Module({
  imports: [MongooseModule.forFeature([{ name: Unite.name, schema: UniteSchema }])],
  controllers: [UniteController],
  providers: [UniteService, RolesGuard],
  exports: [UniteService],
})
export class UniteModule {}
