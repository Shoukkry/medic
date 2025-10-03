import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/auth/auth.service';
import { RegisterAdminDto } from '../src/auth/dto/register-admin.dto';

type ParsedArgs = {
  username?: string;
  email?: string;
  password?: string;
  token?: string;
  firstName?: string;
  lastName?: string;
};

function parseArgs(argv: string[]): ParsedArgs {
  const parsed: ParsedArgs = {};
  argv.forEach((arg) => {
    const [key, value] = arg.split('=');
    const normalizedKey = key.replace(/^--/, '').trim();
    if (normalizedKey && value !== undefined) {
      (parsed as Record<string, string | undefined>)[normalizedKey] = value.trim();
    }
  });
  return parsed;
}

function printUsage(): void {
  // eslint-disable-next-line no-console
  console.log(`Usage: npm run admin:create -- --username=admin --email=admin@example.com --password=Secret123 --token=YOUR_SETUP_TOKEN [--firstName=John] [--lastName=Doe]`);
}

async function bootstrap(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const requiredFields: (keyof ParsedArgs)[] = ['username', 'email', 'password', 'token'];
  const missing = requiredFields.filter((field) => !args[field]);

  if (missing.length > 0) {
    // eslint-disable-next-line no-console
    console.error(`Arguments manquants: ${missing.join(', ')}`);
    printUsage();
    process.exitCode = 1;
    return;
  }

  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });

  try {
    const authService = app.get(AuthService);

    const dto: RegisterAdminDto = {
      token: args.token!,
      username: args.username!,
      email: args.email!,
      password: args.password!,
      firstName: args.firstName,
      lastName: args.lastName,
    };

    const result = await authService.registerAdmin(dto);
    // eslint-disable-next-line no-console
    console.log('Administrateur créé ou mis à jour avec succès.');
    // eslint-disable-next-line no-console
    console.log('Identifiants :', {
      id: result.user.id,
      username: result.user.username,
      email: result.user.email,
      role: result.user.role,
    });
    // eslint-disable-next-line no-console
    console.log('Token (à utiliser uniquement pour vérification manuelle) :', result.accessToken);
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error('Échec de la création administrateur :', error?.message || error);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

bootstrap();
