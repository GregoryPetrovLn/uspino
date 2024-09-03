import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });
  }

  async sendLimitExceededEmail(userId: number, userLimit: number) {
    // In a real application, you would fetch the user's email from the database
    const userEmail = 'user@example.com'; // Replace with actual user email

    const mailOptions = {
      from: this.configService.get<string>('EMAIL_USER'),
      to: userEmail,
      subject: 'Weather API Request Limit Exceeded',
      text: `Dear user,\n\nYou have exceeded your daily limit of ${userLimit} requests for the Weather API.\n\nPlease try again tomorrow or upgrade your plan for more requests.\n\nBest regards,\nWeather API Team`,
    };

    await this.transporter.sendMail(mailOptions);
  }
}