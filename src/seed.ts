import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from './app.module';
import { User } from './users/user.entity';

async function seed() {
  const app = await NestFactory.create(AppModule);
  const userRepository = app.get<Repository<User>>(getRepositoryToken(User));

  const users = [
    { username: 'user1', email: 'user1@example.com', password: 'password1', firstName: 'John', lastName: 'Doe' },
    { username: 'user2', email: 'user2@example.com', password: 'password2', firstName: 'Jane', lastName: 'Smith' },
  ];

  for (const userData of users) {
    const user = userRepository.create(userData);
    await userRepository.save(user);
  }

  console.log('Seed data inserted successfully');
  await app.close();
}

seed();