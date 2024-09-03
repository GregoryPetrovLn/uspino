import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';

@Module({
  imports: [CacheModule, RabbitMQModule],
  providers: [WeatherService],
  controllers: [WeatherController],
})
export class WeatherModule {}
