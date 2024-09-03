import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

import { ConfigService } from '@nestjs/config';
import { User } from 'src/users/user.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    this.logger.debug(`Attempting to validate user: ${username}`);
    const user = await this.usersService.findOne(username);
    if (user && await bcrypt.compare(pass, user.password)) {
      this.logger.debug(`User ${username} validated successfully`);
      const { password, ...result } = user;
      return result;
    }
    this.logger.warn(`Failed to validate user: ${username}`);
    return null;
  }

  async login(user: any) {
    this.logger.debug(`Generating JWT for user: ${user.username}`);
    const payload = { username: user.username, sub: user.id };
    const expiresIn = this.configService.get<string>('JWT_EXPIRATION_TIME') + 's';
    return {
      access_token: this.jwtService.sign(payload, { expiresIn }),
    };
  }

  async register(createUser: User) {
    this.logger.debug(`Attempting to register user: ${createUser.username}`);
    const hashedPassword = await bcrypt.hash(createUser.password, 10);
    const user = await this.usersService.create({
      ...createUser,
      password: hashedPassword,
    });
    this.logger.debug(`User registered successfully: ${user.username}`);
    return this.login(user);
  }

  decodeToken(token: string): any {
    try {
      return jwt.decode(token);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  async validateToken(username: string): Promise<any> {
    console.log('AuthService validateToken called with username:', username);
    try {
      const user = await this.usersService.findOne(username);
      console.log('User found:', user);
      if (!user) {
        console.warn(`User not found: ${username}`);
        throw new UnauthorizedException('User not found');
      }
      console.log(`Token validated successfully for user: ${user.username}`);
      return user;
    } catch (error) {
      console.error(`Token validation failed:`, error);
      throw new UnauthorizedException('Invalid token');
    }
  }
}