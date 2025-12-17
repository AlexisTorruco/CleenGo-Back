import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class NodemailerService {
  private readonly logger = new Logger(NodemailerService.name);
  private readonly resend: Resend;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');

    if (!apiKey) {
      throw new Error('RESEND_API_KEY no está definida');
    }

    this.resend = new Resend(apiKey);
  }

  async sendMail(options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }) {
    const fromName =
      this.configService.get<string>('MAIL_FROM_NAME') ?? 'CleenGo';
    const fromAddress =
      this.configService.get<string>('MAIL_FROM_ADDRESS') ??
      'onboarding@resend.dev';

    try {
      const { data, error } = await this.resend.emails.send({
        from: `${fromName} <${fromAddress}>`,
        to: [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      if (error) {
        this.logger.error(`❌ Resend error: ${error.message}`);
        throw error;
      }

      this.logger.log(
        `📧 Email enviado (Resend) a ${options.to}. id: ${data?.id}`,
      );
      return data;
    } catch (err: any) {
      this.logger.error(
        `❌ Error enviando email (Resend) a ${options.to}: ${err?.message}`,
      );
      throw new InternalServerErrorException(
        'No se pudo enviar el correo. Intenta más tarde.',
      );
    }
  }
}
