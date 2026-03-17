import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly isConfigured: boolean;

  constructor(private config: ConfigService) {
    const apiKey = this.config.get<string>('SENDGRID_API_KEY');

    if (apiKey && !apiKey.startsWith('SG.your_')) {
      sgMail.setApiKey(apiKey);
      this.isConfigured = true;
    } else {
      this.isConfigured = false;
      this.logger.warn(
        'SendGrid API key not configured — emails will be logged to console only',
      );
    }
  }

  async sendVerificationCode(email: string, code: string): Promise<void> {
    const from = {
      email:
        this.config.get<string>('SENDGRID_FROM_EMAIL') ??
        'noreply@hiking-app.com',
      name: this.config.get<string>('SENDGRID_FROM_NAME') ?? 'Hiking App',
    };

    const subject = 'Підтвердження email — Hiking App';
    const html = `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #0a7ea4;">Підтвердіть ваш email</h2>
        <p>Ваш код підтвердження:</p>
        <div style="
          display: inline-block;
          background: #f0f4f8;
          border-radius: 12px;
          padding: 16px 32px;
          font-size: 36px;
          font-weight: 700;
          letter-spacing: 8px;
          color: #11181C;
          margin: 16px 0;
        ">${code}</div>
        <p style="color: #687076; font-size: 14px;">Код дійсний 15 хвилин. Не передавайте його нікому.</p>
      </div>
    `;

    if (!this.isConfigured) {
      this.logger.log(
        `[EMAIL STUB] To: ${email} | Subject: ${subject} | Code: ${code}`,
      );
      return;
    }

    await sgMail.send({ to: email, from, subject, html });
  }
}
