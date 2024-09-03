import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOne(username: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async create(username: string, password: string): Promise<User> {
    const user = this.usersRepository.create({ username, password });
    return this.usersRepository.save(user);
  }

  async incrementRequestCount(userId: number): Promise<void> {
    await this.usersRepository.increment({ id: userId }, 'requestCount', 1);
  }
}