import { ArgumentsHost, Catch, ExceptionFilter, HttpException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    console.error('Global exception caught:', exception);
    if (exception instanceof HttpException) {
      throw exception;
    }
    throw new HttpException('Internal server error', 500);
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.use((req, res, next) => {
    console.log(`Request ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    next();
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new GlobalExceptionFilter());
  
  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();