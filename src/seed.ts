import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { User } from './users/user.entity';

config();

async function seed() {
  const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    entities: [User],
    synchronize: true,
  });

  try {
    await AppDataSource.initialize();
    console.log('Data Source has been initialized!');

    const userRepository = AppDataSource.getRepository(User);

    const users = [
      {
        username: 'user1',
        email: 'user1@example.com',
        password: 'Password1!',
        firstName: 'John',
        lastName: 'Doe',
      },
      {
        username: 'user2',
        email: 'user2@example.com',
        password: 'Password2!',
        firstName: 'Jane',
        lastName: 'Smith',
      },
      {
        username: 'user3',
        email: 'user3@example.com',
        password: 'Password3!',
        firstName: 'Bob',
        lastName: 'Johnson',
      },
    ];

    for (const userData of users) {
      const user = userRepository.create(userData);
      await userRepository.save(user);
      console.log(`Created user: ${user.username}`);
    }

    console.log('Database seeding completed.');
  } catch (error) {
    console.error('Error during Data Source initialization or seeding:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

seed();
