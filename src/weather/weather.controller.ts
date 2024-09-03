import {
  Controller,
  Get,
  Query,
  Req,
  UseGuards
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { WeatherService } from './weather.service';

@Controller('weather')
@UseGuards(AuthGuard('jwt'))
export class WeatherController {
  constructor(
    private weatherService: WeatherService,
    private jwtStrategy: JwtStrategy,
  ) {}
  @Get()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async getWeather(
    @Query('city') city: string,

    @Req() request: Request,
  ) {
  
    return this.weatherService.getWeather(city);
  }

  @Get('limit')
  async getLimit(@Req() request: Request) {
    console.log('Auth Header:', request.headers.authorization);
    console.log('User:', request.user);
    return this.weatherService.getUserLimit();
  }

  @Get('test')
  @UseGuards(AuthGuard('jwt'))
  async testEndpoint(@Req() request: Request) {
    console.log('Weather test endpoint accessed');
    console.log('Auth Header:', request.headers.authorization);
    console.log('User:', request['user']);
    return { message: 'Weather test endpoint is working' };
  }
}
