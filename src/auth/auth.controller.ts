import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/users/user.entity';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {
    console.log('AuthController instantiated');
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req) {
    console.log('Login route accessed');
    return this.authService.login(req.user);
  }

  @Post('register')
  async register(@Body() createUser: User) {
    console.log('Register route accessed');
    return this.authService.register(createUser);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('validate')
  async validateUser(@Request() req) {
    console.log('Validate route accessed');
    return req.user;
  }x

  @Get('test')
  testRoute() {
    console.log('Auth test route accessed');
    return { message: 'Auth controller is working' };
  }
}