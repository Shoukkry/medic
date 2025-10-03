import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { QuestionsModule } from './questions/questions.module';
import { UniteModule } from './categorie/unites/unite.module';
import { ModuleModule } from './categorie/modules/module.module';
import { CoursModule } from './categorie/cours/cours.module';
import {AuthModule} from './auth/auth.module'
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    // Charge les variables .env globalement
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config: Record<string, unknown>) => {
        const mongoUri = config.MONGO_URI ? String(config.MONGO_URI) : '';
        if (!mongoUri) {
          throw new Error('La variable MONGO_URI est requise.');
        }

        const portValue = config.PORT !== undefined ? Number(config.PORT) : 3000;
        if (Number.isNaN(portValue)) {
          throw new Error('La variable PORT doit être un nombre.');
        }

        const allowedOrigins = config.ALLOWED_ORIGINS
          ? String(config.ALLOWED_ORIGINS)
          : undefined;

        const jwtSecret = config.JWT_SECRET ? String(config.JWT_SECRET) : '';
        if (!jwtSecret) {
          throw new Error('La variable JWT_SECRET est requise.');
        }

        const jwtExpiresIn = config.JWT_EXPIRES_IN
          ? String(config.JWT_EXPIRES_IN)
          : '7d';

        return {
          MONGO_URI: mongoUri,
          PORT: portValue,
          ADMIN_SETUP_TOKEN: config.ADMIN_SETUP_TOKEN ? String(config.ADMIN_SETUP_TOKEN) : undefined,
          ALLOWED_ORIGINS: allowedOrigins,
          JWT_SECRET: jwtSecret,
          JWT_EXPIRES_IN: jwtExpiresIn,
        };
      },
    }),

    // Connexion MongoDB via variable d’environnement
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),

    AuthModule,
    UsersModule,
    UniteModule,
    ModuleModule,
    CoursModule,
    QuestionsModule,


  ],
})
export class AppModule {}
