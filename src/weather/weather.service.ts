import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';

@Injectable()
export class WeatherService {
  constructor(
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getWeather(city: string, date: string) {
    // Implement weather fetching logic here
  }

  async getUserLimit() {
    // Implement user limit logic here
  }

  @RabbitRPC({
    exchange: 'weather',
    routingKey: 'getUserLimit',
    queue: 'weather_user_limit',
  })
  public async getUserLimitRPC(data: { userId: string }) {
    // Implement RPC logic here
  }
}