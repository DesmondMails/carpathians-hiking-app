import {
  SESv2Client,
  SendEmailCommand,
  SendEmailCommandOutput,
} from '@aws-sdk/client-sesv2';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { getEmailVerificationTemplate } from './templates/verification-email.template';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly sesClient: SESv2Client;
  private readonly fromEmail: string;

  constructor(private configService: ConfigService) {
    this.sesClient = new SESv2Client({
      region: this.configService.getOrThrow<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
      },
    });

    this.fromEmail = this.configService.getOrThrow<string>('SES_FROM_EMAIL');
  }

  async sendEmail(params: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }) {
    try {
      const command = new SendEmailCommand({
        FromEmailAddress: this.fromEmail,
        Destination: {
          ToAddresses: [params.to],
        },
        Content: {
          Simple: {
            Subject: {
              Data: params.subject,
              Charset: 'UTF-8',
            },
            Body: {
              Html: {
                Data: params.html,
                Charset: 'UTF-8',
              },
              ...(params.text && {
                Text: {
                  Data: params.text,
                  Charset: 'UTF-8',
                },
              }),
            },
          },
        },
      });

      const result = await this.sesClient.send(command);

      this.logger.log(
        `Email sent to ${params.to}, messageId=${result.MessageId}`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${params.to}`,
        error instanceof Error ? error.stack : undefined,
      );

      throw error;
    }
  }

  async sendVerificationCode(
    email: string,
    code: string,
  ): Promise<SendEmailCommandOutput> {
    const subject = 'Підтвердження email — Hiking App';
    const html = getEmailVerificationTemplate(code);
    const text = `Ваш код підтвердження: ${code}. Код дійсний 15 хвилин.`;

    return this.sendEmail({ to: email, subject, html, text });
  }
}
