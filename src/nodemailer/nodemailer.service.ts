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
      throw new Error('RESEND_API_KEY is missing');
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
    const fromAddress = this.configService.get<string>('MAIL_FROM_ADDRESS');

    // ✅ clave: no permitimos fallback a gmail
    if (!fromAddress) {
      this.logger.error('MAIL_FROM_ADDRESS is missing');
      throw new InternalServerErrorException('Email sender not configured');
    }

    const from = `"${fromName}" <${fromAddress}>`;

    try {
      const { data, error } = await this.resend.emails.send({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      if (error) {
        this.logger.error(`❌ Resend error: ${error.message}`);
        throw new Error(error.message);
      }

      this.logger.log(`📧 Email enviado a ${options.to}. Id: ${data?.id}`);
      return data;
    } catch (err: any) {
      this.logger.error(
        `❌ Error enviando email (Resend) a ${options.to}: ${err.message}`,
      );
      throw new InternalServerErrorException(
        'No se pudo enviar el correo. Intenta más tarde.',
      );
    }
  }
}
