import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import * as jwt from 'jsonwebtoken';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    console.log('JwtStrategy initializing with secret:', jwtSecret.substring(0, 4));
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
    console.log('JwtStrategy initialized');
  }

  async validate(payload: any) {
    console.log('JwtStrategy validate method called with payload:', payload);
    try {
      const user = await this.authService.validateToken(payload.username);
      console.log('User validated:', user);
      return user;
    } catch (error) {
      console.error('Error in JwtStrategy validate method:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }

  decodeToken(req: any) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (token) {
      try {
        const decoded = jwt.decode(token);
        console.log('Decoded token:', decoded);
        return decoded;
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
    return null;
  }
}