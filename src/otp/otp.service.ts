import { Injectable, Logger } from '@nestjs/common';
import Twilio from 'twilio';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private client: ReturnType<typeof Twilio> | null;
  private fromNumber: string | null;

  // Stockage simple en mémoire pour exemple (production: Redis ou DB)
  private otpStore = new Map<string, { code: string; expiresAt: number }>();

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
    const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER?.trim() ?? null;

    if (!accountSid || !authToken) {
      this.logger.warn(
        'Les identifiants Twilio sont manquants. Envoi SMS OTP désactivé.',
      );
      this.client = null;
      return;
    }

    try {
      this.client = Twilio(accountSid, authToken); // pas de 'new'
    } catch (error) {
      this.logger.error('Initialisation Twilio échouée', error as Error);
      this.client = null;
    }
  }

  async sendOtp(phone: string) {
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // OTP 6 chiffres
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 min de validité

    this.otpStore.set(phone, { code, expiresAt });

    if (!this.client || !this.fromNumber) {
      this.logger.debug(`OTP généré pour ${phone} (mode sans SMS): ${code}`);
      return {
        success: true,
        sid: 'local-fallback',
        message: 'Service SMS non configuré. Code OTP consigné dans les logs.',
      };
    }

    try {
      const message = await this.client.messages.create({
        body: `Votre code OTP est : ${code}`,
        from: this.fromNumber,
        to: phone,
      });

      return { success: true, sid: message.sid };
    } catch (error) {
      const err = error as Error;
      this.logger.error('Envoi OTP Twilio échoué', err);
      const message =
        err.message === 'username is required'
          ? 'Paramètres Twilio manquants ou invalides (Account SID).'
          : err.message;
      return { success: false, error: message };
    }
  }

  verifyOtp(phone: string, code: string) {
    const record = this.otpStore.get(phone);
    if (!record) return false;
    if (record.expiresAt < Date.now()) {
      this.otpStore.delete(phone);
      return false;
    }
    const valid = record.code === code;
    if (valid) this.otpStore.delete(phone);
    return valid;
  }
}
