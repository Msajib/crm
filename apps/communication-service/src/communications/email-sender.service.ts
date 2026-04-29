import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { jsPDF } from 'jspdf';

@Injectable()
export class EmailSenderService {
  private readonly logger = new Logger(EmailSenderService.serviceName);
  private static readonly serviceName = 'EmailSenderService';

  async sendEmail(config: any, options: { to: string, subject: string, html: string, attachments?: any[] }) {
    this.logger.log(`Sending email to ${options.to} using ${config.provider}`);

    let transporter: nodemailer.Transporter;

    if (config.provider === 'SMTP') {
      transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
          user: config.user,
          pass: config.pass,
        },
      });
    } else {
      // For SendGrid, Mailgun etc, we could implement specific logic or use SMTP relays
      // For now, we simulate or assume they use SMTP relay if not specifically implemented
      this.logger.warn(`Provider ${config.provider} not fully implemented, falling back to SMTP simulation.`);
      transporter = nodemailer.createTransport({
        host: config.host || 'smtp.relay.local',
        port: config.port || 587,
        secure: config.secure,
        auth: {
          user: config.user || config.apiKey,
          pass: config.pass || config.apiKey,
        },
      });
    }

    try {
      await transporter.sendMail({
        from: `"${config.fromName}" <${config.fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        attachments: options.attachments,
      });
      this.logger.log(`Email sent successfully to ${options.to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}: ${error.message}`);
      throw error;
    }
  }

  async generateInvoicePdf(data: { invoiceId: string, amount: string, planName: string, customerName: string }) {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.text('INVOICE', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(`Invoice ID: ${data.invoiceId}`, 20, 40);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 45);
    
    // Billing Info
    doc.setFontSize(12);
    doc.text('Bill To:', 20, 60);
    doc.setFontSize(10);
    doc.text(data.customerName, 20, 65);
    
    // Details Table
    doc.line(20, 80, 190, 80);
    doc.text('Description', 20, 85);
    doc.text('Amount', 170, 85, { align: 'right' });
    doc.line(20, 90, 190, 90);
    
    doc.text(data.planName, 20, 100);
    doc.text(`$${data.amount}`, 170, 100, { align: 'right' });
    
    doc.line(20, 110, 190, 110);
    doc.setFontSize(12);
    doc.text('Total:', 140, 120);
    doc.text(`$${data.amount}`, 170, 120, { align: 'right' });
    
    // Footer
    doc.setFontSize(8);
    doc.text('Thank you for your business!', 105, 150, { align: 'center' });
    
    return Buffer.from(doc.output('arraybuffer'));
  }
}
