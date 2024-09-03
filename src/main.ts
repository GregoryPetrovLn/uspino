import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    console.error('Global exception caught:', exception);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const message = exception.message;
      console.error(`HTTP Exception: ${status} - ${message}`);
      response.status(status).json({
        statusCode: status,
        message: message,
      });
    } else {
      console.error('Unexpected error:', exception);
      response.status(500).json({
        statusCode: 500,
        message: 'Internal server error',
      });
    }
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
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        console.error('Validation errors:', errors);
        return errors;
      },
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());

  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap().catch((error) => {
  console.error('Failed to start the application:', error);
});
