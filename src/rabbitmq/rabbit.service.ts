import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class RabbitMQService implements OnModuleInit {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async onModuleInit() {
    await this.setupExchangeAndQueue();
  }

  private async setupExchangeAndQueue() {
    const channel = this.amqpConnection.channel;
    await channel.assertExchange('user.events', 'topic', { durable: true });
    await channel.assertQueue('user-limit-exceeded-emails', { durable: true });
    await channel.bindQueue('user-limit-exceeded-emails', 'user.events', 'user.limit.exceeded');
  }

  async sendLimitExceededMessage(userId: number, userLimit: number) {
    await this.amqpConnection.publish('user.events', 'user.limit.exceeded', {
      userId,
      userLimit,
    });
  }
}