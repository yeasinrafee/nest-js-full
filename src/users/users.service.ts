import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

export interface User {
  id: number;
  name: string;
  email: string;
  age?: number;
  createdAt: Date;
}

@Injectable()
export class UsersService {
  private users: User[] = [
    {
      id: 1,
      name: 'Yeasin',
      email: 'yeasin@gmail.com',
      age: 23,
      createdAt: new Date(),
    },
    {
      id: 2,
      name: 'Rafee',
      email: 'rafee@gmail.com',
      age: 25,
      createdAt: new Date(),
    },
  ];

  private nextId = 3;

  create(createUserDto: CreateUserDto): User {
    const newUser: User = {
      id: this.nextId++,
      ...createUserDto,
      createdAt: new Date(),
    };
    this.users.push(newUser);
    return newUser;
  }

  findAll(): User[] {
    return this.users;
  }

  findOne(id: number): User | undefined {
    const user = this.users.find((u) => u.id === id);

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto): User | undefined {
    const user = this.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    Object.assign(user, updateUserDto);
    return user;
  }

  remove(id: number): { message: string } {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    this.users.splice(index, 1);
    return { message: `User with id ${id} removed` };
  }
}
