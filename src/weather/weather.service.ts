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

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private userLimitService: UserLimitService,
    private rabbitMQService: RabbitMQService,
  ) {
    this.apiKey = this.configService.get<string>('WEATHER_API_KEY');
    this.apiUrl = this.configService.get<string>('WEATHER_API_URL');
  }

  async getWeather(userId: number, city: string, date: string) {
    // Check user limit
    const isLimitExceeded = await this.userLimitService.isLimitExceeded(userId);
    if (isLimitExceeded) {
      const userLimit = this.userLimitService.getUserLimit();
      await this.rabbitMQService.sendLimitExceededMessage(userId, userLimit);
      throw new HttpException('User request limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
    }

    // Increment user request count
    await this.userLimitService.incrementUserRequestCount(userId);

    const cacheKey = `weather:${city}:${date}`;
    const cachedData = await this.cacheManager.get(cacheKey);

    if (cachedData) {
      return cachedData;
    }

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

      // Cache the data
      await this.cacheManager.set(cacheKey, data, this.configService.get<number>('CACHE_TTL') * 1000);

      return data;
    } catch (error) {
      return null;
    }
  }
}