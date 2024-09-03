import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { EmailService } from './email.services';


@Injectable()
export class EmailConsumer {
  constructor(private readonly emailService: EmailService) {}

  @RabbitSubscribe({
    exchange: 'user.events',
    routingKey: 'user.limit.exceeded',
    queue: 'user-limit-exceeded-emails',
    createQueueIfNotExists: false, 
  })
  async handleLimitExceededEmail(msg: { userId: number; userLimit: number }) {
    try {
      await this.emailService.sendLimitExceededEmail(msg.userId, msg.userLimit);
    } catch (error) {
      console.error('Failed to send limit exceeded email:', error);
      throw error; 
    }
  }
}