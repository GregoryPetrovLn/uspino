import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '../users/users.module';

import { EmailConsumer } from './email.consumer';
import { EmailService } from './email.services';

@Module({
  imports: [ConfigModule, UsersModule],
  providers: [EmailService, EmailConsumer],
  exports: [EmailService],
})
export class EmailModule {}