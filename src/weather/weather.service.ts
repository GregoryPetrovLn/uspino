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

  async getWeather(city: string) {
    const url = `${this.apiUrl}?q=${city}&appid=${this.apiKey}`;

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

      // Log the received data for debugging
      console.log('Received weather data:', JSON.stringify(data, null, 2));

      return data;
    } catch (error) {
      return null;
    }
  }

  async getUserLimit() {
    return { limit: 50 };
  }

  async sendLimitExceededMessage(userId: string, userLimit: number) {
    console.log(`User ${userId} has exceeded the limit of ${userLimit}`);
  }
}
