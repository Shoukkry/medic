import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Module as ModuleEntity, ModuleSchema } from './schema/module.schema';
import { ModuleService } from './module.service';
import { ModuleController } from './module.controller';
import { RolesGuard } from '../../auth/guards/roles.guard';

@Module({
  imports: [MongooseModule.forFeature([{ name: ModuleEntity.name, schema: ModuleSchema }])],
  controllers: [ModuleController],
  providers: [ModuleService, RolesGuard],
  exports: [ModuleService],
})
export class ModuleModule {}
