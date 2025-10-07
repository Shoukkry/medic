import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';

type VerificationMailParams = {
  to: string;
  verificationLink: string;
  username?: string | null;
  expiresInMinutes: number;
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  constructor(private readonly configService: ConfigService) {}

  private getTransporter() {
    if (this.transporter) {
      return this.transporter;
    }

    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    return this.transporter;
  }

  async sendEmailVerification({
    to,
    verificationLink,
    username,
    expiresInMinutes,
  }: VerificationMailParams) {
    const from = this.configService.get<string>('EMAIL_FROM');

    const salutation = username ? `Bonjour ${username},` : 'Bonjour,';
    const html = `
      <p>${salutation}</p>
      <p>Merci de votre inscription sur QCM Med. Pour finaliser la création de votre compte, veuillez confirmer votre adresse e-mail :</p>
      <p><a href="${verificationLink}" style="color:#2563eb;">Confirmer mon adresse e-mail</a></p>
      <p>Ce lien expirera dans ${expiresInMinutes} minutes.</p>
      <p>Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail.</p>
      <p>L'équipe QCM Med</p>
    `;

    const text = [
      username ? `Bonjour ${username},` : 'Bonjour,',
      '',
      'Merci de votre inscription sur QCM Med.',
      'Pour confirmer votre adresse e-mail, copiez ce lien dans votre navigateur :',
      verificationLink,
      '',
      `Ce lien expirera dans ${expiresInMinutes} minutes.`,
      '',
      "Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.",
      '',
      "L'équipe QCM Med",
    ].join('\n');

    try {
      const transporter = this.getTransporter();
      await transporter.sendMail({
        from,
        to,
        subject: 'Confirmez votre adresse e-mail',
        html,
        text,
      });
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        "Erreur lors de l'envoi du mail de vérification",
        err.stack,
      );
      throw error;
    }
  }
}
