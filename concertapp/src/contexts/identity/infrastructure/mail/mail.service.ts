import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;
    private readonly logger = new Logger(MailService.name);

    constructor(private readonly configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get<string>('MAIL_HOST', 'smtp.gmail.com'),
            port: this.configService.get<number>('MAIL_PORT', 587),
            auth: {
                user: this.configService.get<string>('MAIL_USER', 'test'),
                pass: this.configService.get<string>('MAIL_PASS', 'test'),
            },
        });
    }

    async sendPasswordResetEmail(to: string, token: string): Promise<void> {
        const resetUrl = `${this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000')}/reset-password?token=${token}`;

        try {
            await this.transporter.sendMail({
                from: this.configService.get<string>('MAIL_FROM', '"Concert App" <noreply@concertapp.com>'),
                to,
                subject: 'Password Reset Request',
                text: `You requested a password reset. Click here to reset your password: ${resetUrl}`,
                html: `
                    <h3>Password Reset</h3>
                    <p>You requested a password reset.</p>
                    <p>Click the link below to reset your password:</p>
                    <a href="${resetUrl}">${resetUrl}</a>
                    <p>If you did not request this, please ignore this email.</p>
                `,
            });
            this.logger.log(`Password reset email sent to ${to}`);
        } catch (error) {
            this.logger.error(`Failed to send password reset email to ${to}: ${error.message}`);
            // Log to console for MVP if email isn't configured properly
            this.logger.debug(`[MVP FALLBACK] Password reset link for ${to}: ${resetUrl}`);
        }
    }
}
