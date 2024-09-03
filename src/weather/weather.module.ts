import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from 'src/cache/cache.module';
import { UserLimitService } from 'src/cache/user-limit.service';
import { EmailConsumer } from 'src/email/email.consumer';
import { EmailService } from 'src/email/email.services';
import { RabbitMQService } from 'src/rabbitmq/rabbit.service';
import { RabbitMQModule } from 'src/rabbitmq/rabbitmq.module';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from '../auth/auth.module';
import { JwtStrategy } from '../auth/jwt.strategy';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    AuthModule,
    CacheModule,
    RabbitMQModule, 
    UsersModule,
  ],
  providers: [
    WeatherService,
    JwtStrategy,
    UserLimitService,
    RabbitMQService,
    EmailConsumer,
    EmailService,
  ],
  controllers: [WeatherController],
})
export class WeatherModule {}
