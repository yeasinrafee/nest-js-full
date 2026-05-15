import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Prisma, User } from 'src/generated/prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // Create an user
  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      return await this.prisma.user.create({
        data: createUserDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'This email is already in use. Please choose another one.',
          );
        }
      }
      throw error;
    }
  }

  // Retrieve all the users
  async findAll(search?: string): Promise<User[]> {
    return await this.prisma.user.findMany({
      // Searching implemented
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      include: {
        _count: { select: { posts: true } }, // Count all post
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Retrieve all users with pagination
  async findPaginated(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.user.count(),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  // Retrieve a single user
  async findOne(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { posts: true },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  // Update an user
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    // Search user, if not found throw an error
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  // Delete an user
  async remove(id: number): Promise<{ message: string }> {
    // Search user, if not found throw an error
    await this.findOne(id);

    await this.prisma.user.delete({
      where: { id },
    });
    return { message: `User with id ${id} removed` };
  }
}
