import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class WeatherService {
  private readonly apiKey: string;
  private readonly apiUrl: string;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.apiKey = this.configService.get<string>('WEATHER_API_KEY');
    this.apiUrl = this.configService.get<string>('WEATHER_API_URL');
  }

  async getWeather(city: string, date: string) {
    const url = `${this.apiUrl}/data/2.5/weather?q=${city}&appid=${this.apiKey}&units=metric`;
    
    const { data } = await firstValueFrom(
      this.httpService.get(url).pipe(
        catchError((error: AxiosError) => {
          console.error(error.response.data);
          throw new HttpException('An error occurred while fetching weather data', HttpStatus.BAD_GATEWAY);
        }),
      ),
    );

    return {
      city: data.name,
      temperature: data.main.temp,
      description: data.weather[0].description,
      date: new Date().toISOString(),
    };
  }

  async getUserLimit() {
    // Implement user limit logic here
    // For now, we'll return a static limit
    return { limit: 50 };
  }

  async sendLimitExceededMessage(userId: string, userLimit: number) {
    // Implement message sending logic here
    console.log(`User ${userId} has exceeded the limit of ${userLimit}`);
  }
}