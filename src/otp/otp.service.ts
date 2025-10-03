import { Injectable } from '@nestjs/common';
import Twilio from 'twilio';

@Injectable()
export class OtpService {
  private client;

  // Stockage simple en mémoire pour exemple (production: Redis ou DB)
  private otpStore = new Map<string, { code: string; expiresAt: number }>();

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID!;
    const authToken = process.env.TWILIO_AUTH_TOKEN!;
    this.client = Twilio(accountSid, authToken); // pas de 'new'
  }

  async sendOtp(phone: string) {
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // OTP 6 chiffres
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 min de validité

    this.otpStore.set(phone, { code, expiresAt });

    try {
      const message = await this.client.messages.create({
        body: `Votre code OTP est : ${code}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone,
      });

      return { success: true, sid: message.sid };
    } catch (error) {
      console.error(error);
      return { success: false, error: (error as Error).message };
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
