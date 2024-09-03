import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { WeatherService } from './weather.service';

@Controller('weather')
@UseGuards(AuthGuard('jwt'))
export class WeatherController {
  constructor(private weatherService: WeatherService) {}
  @Get()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async getWeather(@Query('city') city: string, @Query('date') date: string) {
    return this.weatherService.getWeather(city, date);
  }

  @Get('limit')
  async getLimit() {
    return this.weatherService.getUserLimit();
  }

  @Get('test')
  @UseGuards(AuthGuard('jwt'))
  async testEndpoint() {
    return { message: 'Weather test endpoint is working' };
  }
}
