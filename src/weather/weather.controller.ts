import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
  Req,
  UseGuards,
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
    @Query('lat') lat: string,
    @Query('lon') lon: string,
    @Req() request: Request,
  ) {
    console.log('Auth Header:', request.headers.authorization);
    console.log('User:', request.user);

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      throw new HttpException(
        'Invalid latitude or longitude',
        HttpStatus.BAD_REQUEST, 
      );
    }

    return this.weatherService.getWeather(latitude, longitude);
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
