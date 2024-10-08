import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { UserThrottlerGuard } from 'src/guards/user-throttler.guard';
import { WeatherService } from './weather.service';

@Controller('weather')
@UseGuards(AuthGuard('jwt'), UserThrottlerGuard)
export class WeatherController {
  constructor(
    private weatherService: WeatherService,

  ) {}

  @Get()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async getWeather(
    @Req() req: Request,
    @Query('city') city: string,
    @Query('date') date: string,
  ) {
    const userId = req.user['id'];

    return this.weatherService.getWeather(userId, city, date);
  }
}
