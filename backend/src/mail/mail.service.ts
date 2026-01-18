import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

type MailPayload = {
  to: string;
  subject: string;
  html: string;
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly enabled: boolean;
  private readonly fromEmail: string;
  private readonly salonName: string;
  private readonly transporter: nodemailer.Transporter | null;

  constructor(private readonly configService: ConfigService) {
    this.enabled = this.configService.get<string>('MAIL_ENABLED') === 'true';
    this.fromEmail = this.configService.get<string>('MAIL_FROM') || '';
    this.salonName = this.configService.get<string>('SALON_NAME') || 'Nuestro Salon';

    const user = this.configService.get<string>('GMAIL_USER');
    const pass = this.configService.get<string>('GMAIL_APP_PASSWORD');

    if (!this.enabled || !user || !pass || !this.fromEmail) {
      this.transporter = null;
      return;
    }

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass,
      },
    });
  }

  async sendWelcomeEmail(payload: { to: string; name: string }) {
    if (!this.transporter || !this.enabled) {
      return;
    }

    return this.send({
      to: payload.to,
      subject: `Bienvenido/a a ${this.salonName}`,
      html: `
        <h2>Hola ${payload.name}</h2>
        <p>Gracias por registrarte en ${this.salonName}. Estamos listos para ayudarte con tu evento.</p>
        <p>Si tenes dudas, respondé este correo.</p>
      `,
    });
  }

  async sendEventCreatedEmail(payload: {
    to: string;
    name: string;
    eventName: string;
    date: string;
    startTime: string;
    endTime?: string | null;
    total: string;
  }) {
    if (!this.transporter || !this.enabled) {
      return;
    }

    const timeText = payload.endTime
      ? `${payload.startTime} - ${payload.endTime}`
      : payload.startTime;

    return this.send({
      to: payload.to,
      subject: `Evento confirmado: ${payload.eventName}`,
      html: `
        <h2>Hola ${payload.name}</h2>
        <p>Tu evento <strong>${payload.eventName}</strong> fue registrado.</p>
        <p><strong>Fecha:</strong> ${payload.date}</p>
        <p><strong>Horario:</strong> ${timeText}</p>
        <p><strong>Total:</strong> ${payload.total}</p>
        <p>Gracias por elegir ${this.salonName}.</p>
      `,
    });
  }

  async sendPaymentEmail(payload: {
    to: string;
    name: string;
    eventName: string;
    amount: string;
    paidAt: string;
  }) {
    if (!this.transporter || !this.enabled) {
      return;
    }

    return this.send({
      to: payload.to,
      subject: `Pago registrado: ${payload.eventName}`,
      html: `
        <h2>Hola ${payload.name}</h2>
        <p>Registramos un pago para el evento <strong>${payload.eventName}</strong>.</p>
        <p><strong>Monto:</strong> ${payload.amount}</p>
        <p><strong>Fecha:</strong> ${payload.paidAt}</p>
      `,
    });
  }

  private async send(payload: MailPayload) {
    if (!this.transporter) {
      return;
    }

    try {
      await this.transporter.sendMail({
        from: this.fromEmail,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      });
    } catch (error) {
      this.logger.warn(
        `Mail send failed: ${(error as Error).message}`,
      );
    }
  }
}
