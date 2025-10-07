import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { QuestionsModule } from './questions/questions.module';
import { UniteModule } from './categorie/unites/unite.module';
import { ModuleModule } from './categorie/modules/module.module';
import { CoursModule } from './categorie/cours/cours.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StatsModule } from './stats/stats.module';
import { FriendsModule } from './friends/friends.module';
import { MailModule } from './mail/mail.module';

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

        const portValue =
          config.PORT !== undefined ? Number(config.PORT) : 3000;
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

        const smtpHost = config.SMTP_HOST ? String(config.SMTP_HOST) : '';
        if (!smtpHost) {
          throw new Error('La variable SMTP_HOST est requise.');
        }

        const smtpPortValue =
          config.SMTP_PORT !== undefined ? Number(config.SMTP_PORT) : 587;
        if (Number.isNaN(smtpPortValue)) {
          throw new Error('La variable SMTP_PORT doit être un nombre.');
        }

        const smtpUser = config.SMTP_USER ? String(config.SMTP_USER) : '';
        if (!smtpUser) {
          throw new Error('La variable SMTP_USER est requise.');
        }

        const smtpPass = config.SMTP_PASS ? String(config.SMTP_PASS) : '';
        if (!smtpPass) {
          throw new Error('La variable SMTP_PASS est requise.');
        }

        const emailFrom = config.EMAIL_FROM ? String(config.EMAIL_FROM) : '';
        if (!emailFrom) {
          throw new Error('La variable EMAIL_FROM est requise.');
        }

        const verificationUrl = config.EMAIL_VERIFICATION_URL
          ? String(config.EMAIL_VERIFICATION_URL)
          : '';
        if (!verificationUrl) {
          throw new Error('La variable EMAIL_VERIFICATION_URL est requise.');
        }

        return {
          MONGO_URI: mongoUri,
          PORT: portValue,
          ADMIN_SETUP_TOKEN: config.ADMIN_SETUP_TOKEN
            ? String(config.ADMIN_SETUP_TOKEN)
            : undefined,
          ALLOWED_ORIGINS: allowedOrigins,
          JWT_SECRET: jwtSecret,
          JWT_EXPIRES_IN: jwtExpiresIn,
          SMTP_HOST: smtpHost,
          SMTP_PORT: smtpPortValue,
          SMTP_USER: smtpUser,
          SMTP_PASS: smtpPass,
          EMAIL_FROM: emailFrom,
          EMAIL_VERIFICATION_URL: verificationUrl,
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
    StatsModule,
    FriendsModule,
    MailModule,
  ],
})
export class AppModule {}
