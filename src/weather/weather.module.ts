import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from 'src/cache/cache.module';
import { AuthModule } from '../auth/auth.module';
import { JwtStrategy } from '../auth/jwt.strategy';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';

@Module({
  imports: [HttpModule, ConfigModule, AuthModule, CacheModule],
  providers: [WeatherService, JwtStrategy],
  controllers: [WeatherController],
})
export class WeatherModule {}
