import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EmailConsumer } from 'src/email/email.consumer';
import { EmailService } from 'src/email/email.services';
import { UserThrottlerGuard } from 'src/guards/user-throttler.guard';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/auth/auth.service';
import { UserLimitService } from '../src/cache/user-limit.service';
import { RabbitMQService } from '../src/rabbitmq/rabbit.service';
import { WeatherService } from '../src/weather/weather.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let authService: AuthService;
  let weatherService: WeatherService;
  let userLimitService: UserLimitService;
  let rabbitMQService: RabbitMQService;

  beforeAll(async () => {
    process.env.USER_REQUEST_LIMIT = '6';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    authService = moduleFixture.get<AuthService>(AuthService);
    weatherService = moduleFixture.get<WeatherService>(WeatherService);
    userLimitService = moduleFixture.get<UserLimitService>(UserLimitService);
    rabbitMQService = moduleFixture.get<RabbitMQService>(RabbitMQService);

    await app.init();
  });

  afterAll(async () => {
    delete process.env.USER_REQUEST_LIMIT;
    await app.close();
  });

  describe('AuthController (e2e)', () => {
    it('/auth/register (POST)', async () => {
      const newUser = {
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'Test1234!',
        firstName: 'Test',
        lastName: 'User',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(newUser)
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
    });

    it('/auth/login (POST)', async () => {
      const loginCredentials = {
        username: 'testuser',
        password: 'Test1234!',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginCredentials)
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
    });

    it('/auth/validate (GET)', async () => {
      const loginCredentials = {
        username: 'testuser',
        password: 'Test1234!',
      };

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginCredentials);

      const token = loginResponse.body.access_token;

      const response = await request(app.getHttpServer())
        .get('/auth/validate')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('username', 'testuser');
    });
  });

  describe('EmailConsumer', () => {
    let emailConsumer: EmailConsumer;
    let mockEmailService: Partial<EmailService>;

    beforeEach(async () => {
      mockEmailService = {
        sendLimitExceededEmail: jest.fn(),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          EmailConsumer,
          {
            provide: EmailService,
            useValue: mockEmailService,
          },
        ],
      }).compile();

      emailConsumer = module.get<EmailConsumer>(EmailConsumer);
    });

    it('should handle limit exceeded message and send email', async () => {
      const message = { userId: 1, userLimit: 7 };

      await emailConsumer.handleLimitExceededEmail(message);

      expect(mockEmailService.sendLimitExceededEmail).toHaveBeenCalledWith(
        1,
        7,
      );
    });

    it('should throw an error if email sending fails', async () => {
      const message = { userId: 1, userLimit: 7 };
      (mockEmailService.sendLimitExceededEmail as jest.Mock).mockRejectedValue(
        new Error('Email sending failed'),
      );

      await expect(
        emailConsumer.handleLimitExceededEmail(message),
      ).rejects.toThrow('Email sending failed');
    });
  });

  describe('WeatherController (e2e)', () => {
    let app: INestApplication;
    let token: string;
    let mockUserLimitService: jest.Mocked<Partial<UserLimitService>>;
    let mockRabbitMQService: jest.Mocked<Partial<RabbitMQService>>;
    let mockUserThrottlerGuard: jest.Mocked<Partial<UserThrottlerGuard>>;

    beforeAll(async () => {
      mockUserLimitService = {
        isLimitExceeded: jest.fn().mockResolvedValue(false),
        incrementUserRequestCount: jest.fn().mockResolvedValue(1),
        getUserLimit: jest.fn().mockReturnValue(7),
      };

      mockRabbitMQService = {
        sendLimitExceededMessage: jest.fn().mockResolvedValue(undefined),
      };

      mockUserThrottlerGuard = {
        canActivate: jest.fn().mockReturnValue(true),
      };

      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      })
        .overrideProvider(UserLimitService)
        .useValue(mockUserLimitService)
        .overrideProvider(RabbitMQService)
        .useValue(mockRabbitMQService)
        .overrideGuard(UserThrottlerGuard)
        .useValue(mockUserThrottlerGuard)
        .compile();

      app = moduleFixture.createNestApplication();
      await app.init();
    });

    beforeEach(async () => {
      const loginCredentials = {
        username: 'testuser',
        password: 'Test1234!',
      };

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginCredentials);

      token = loginResponse.body.access_token;

      jest.clearAllMocks();
      mockUserLimitService.isLimitExceeded.mockResolvedValue(false);
      mockUserLimitService.incrementUserRequestCount.mockResolvedValue(1);
    });

    afterAll(async () => {
      await app.close();
    });

    it('/weather (GET)', async () => {
      const response = await request(app.getHttpServer())
        .get('/weather?city=London&date=2023-09-01')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.city).toHaveProperty('name', 'London');
      expect(response.body.list[0].main).toHaveProperty('temp');
      expect(response.body.list[0].weather[0]).toHaveProperty('description');
    });

    it('/weather (GET) - Per-minute rate limiting', async () => {
      for (let i = 0; i < 4; i++) {
        await request(app.getHttpServer())
          .get('/weather?city=London&date=2023-09-01')
          .set('Authorization', `Bearer ${token}`)
          .expect(200);
      }

      await request(app.getHttpServer())
        .get('/weather?city=London&date=2023-09-01')
        .set('Authorization', `Bearer ${token}`)
        .expect(429);
    });
  });
});
