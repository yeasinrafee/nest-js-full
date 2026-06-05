import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Res,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import type { Response } from 'express';
import { User } from 'src/generated/prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Role, Roles } from 'src/common/decorators/roles.decorator';
import { ParsePositiveIntPipe } from 'src/common/pipes/parse-positive-int.pipe';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.usersService.create(createUserDto);
  }

  @Get()
  async findAll(
    @Res() res: Response,
    @Query('search') search?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    const users = await this.usersService.findAll(search);

    if (page) {
      const paginatedData = await this.usersService.findPaginated(
        page,
        limit ?? 10,
      );
      return res.status(HttpStatus.OK).json(paginatedData);
    }
    return res.status(HttpStatus.OK).json({
      success: true,
      data: users,
      message: 'Users retrieved successfully',
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return await this.usersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id', ParsePositiveIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return await this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    return await this.usersService.remove(id);
  }
}
