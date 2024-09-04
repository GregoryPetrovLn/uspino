import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { Cache } from 'cache-manager';
import { catchError, firstValueFrom } from 'rxjs';
import { UserLimitService } from 'src/cache/user-limit.service';
import { RabbitMQService } from 'src/rabbitmq/rabbit.service';

@Injectable()
export class WeatherService {
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly cacheTTL: number;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private userLimitService: UserLimitService,
    private rabbitMQService: RabbitMQService,
  ) {
    this.apiKey = this.configService.get<string>('WEATHER_API_KEY');
    this.apiUrl = this.configService.get<string>('WEATHER_API_URL');
    this.cacheTTL = this.configService.get<number>('CACHE_TTL') * 1000;
  }

  async getWeather(userId: number, city: string, date: string) {
    await this.checkUserLimit(userId);
    await this.userLimitService.incrementUserRequestCount(userId);

    const cacheKey = this.getCacheKey(city, date);
    const cachedData = await this.getCachedData(cacheKey);
    if (cachedData) return cachedData;

    const weatherData = await this.fetchWeatherData(city, date);
    await this.cacheData(cacheKey, weatherData);

    return weatherData;
  }

  private async checkUserLimit(userId: number): Promise<void> {
    const isLimitExceeded = await this.userLimitService.isLimitExceeded(userId);
    if (isLimitExceeded) {
      const userLimit = this.userLimitService.getUserLimit();
      await this.rabbitMQService.sendLimitExceededMessage(userId, userLimit);
      throw new HttpException(
        'User request limit exceeded',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  private getCacheKey(city: string, date: string): string {
    return `weather:${city}:${date}`;
  }

  private async getCachedData(cacheKey: string): Promise<any> {
    return this.cacheManager.get(cacheKey);
  }

  private async fetchWeatherData(city: string, date: string): Promise<any> {
    const url = `${this.apiUrl}?q=${city}&dt=${date}&appid=${this.apiKey}`;

    try {
      const { data } = await firstValueFrom(
        this.httpService.get(url).pipe(
          catchError((error: AxiosError) => {
            console.log(error.response.data);
            throw new HttpException(
              'An error occurred while fetching the weather data',
              HttpStatus.BAD_GATEWAY,
            );
          }),
        ),
      );
      return data;
    } catch (error) {
      return null;
    }
  }

  private async cacheData(cacheKey: string, data: any): Promise<void> {
    await this.cacheManager.set(cacheKey, data, this.cacheTTL);
  }
}
