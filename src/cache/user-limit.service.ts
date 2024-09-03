import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class UserLimitService {
  private readonly redis: Redis;
  private readonly defaultUserLimit: number;
  private readonly requestCountExpiration: number;

  constructor(private configService: ConfigService) {
    this.redis = new Redis({
      host: this.configService.get<string>('REDIS_HOST'),
      port: this.configService.get<number>('REDIS_PORT'),
    });
    this.defaultUserLimit = this.configService.get<number>('DEFAULT_USER_REQUEST_LIMIT', 100);
    this.requestCountExpiration = this.configService.get<number>('REQUEST_COUNT_EXPIRATION', 86400);
  }


  private getUserKey(userId: number): string {
    return `user:${userId}:requestCount`;
  }

  async incrementUserRequestCount(userId: number): Promise<number> {
    const key = this.getUserKey(userId);
    const count = await this.redis.incr(key);
    if (count === 1) {
      await this.redis.expire(key, this.requestCountExpiration);
    }
    return count;
  }

  async getUserRequestCount(userId: number): Promise<number> {
    const key = this.getUserKey(userId);
    const count = await this.redis.get(key);
    console.log('-------count',count) 
    return count ? parseInt(count, 10) : 0;
  }

  async isLimitExceeded(userId: number): Promise<boolean> {
    const count = await this.getUserRequestCount(userId);
    return count >= this.defaultUserLimit;
  }

  getUserLimit(): number {
    return this.defaultUserLimit;
  }
}