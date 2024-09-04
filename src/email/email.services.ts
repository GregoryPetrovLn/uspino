import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { UsersService } from '../users/users.service';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'), 
      },
    });
  }

  async sendLimitExceededEmail(userId: number, userLimit: number) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const mailOptions = {
      from: this.configService.get<string>('EMAIL_USER'),
      to: user.email, 
      subject: 'Weather API Request Limit Exceeded',
      text: `Dear ${user.firstName},\n\nYou have exceeded your daily limit of ${userLimit} requests for the Weather API.\n\nPlease try again tomorrow or upgrade your plan for more requests.\n\nBest regards,\nWeather API Team`,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Limit exceeded email sent successfully');
    } catch (error) {
      console.error('Failed to send limit exceeded email:', error);
      throw error;
    }
  }
}
