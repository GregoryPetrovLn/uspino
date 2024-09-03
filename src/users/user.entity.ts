import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  username: string;

  @Column()
  @IsEmail()
  email: string;

  @Column()
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password is too weak',
  })
  password: string;

  @Column()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @Column()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;

  @Column({ default: 0 })
  requestCount: number;
}
