import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Patch,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post as Posts } from 'src/generated/prisma/client';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  async create(@Body() createPostDto: CreatePostDto): Promise<Posts> {
    return await this.postsService.create(createPostDto);
  }

  @Get()
  async findAll(@Query('search') search?: string): Promise<Posts[]> {
    return await this.postsService.findAll(search);
  }

  @Get('published')
  async findPublished(): Promise<Posts[]> {
    return await this.postsService.findPublished();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Posts> {
    return await this.postsService.findOne(id);
  }

  @Patch(':id/published')
  async togglePublishedStatus(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Posts> {
    return await this.postsService.togglePublishedStatus(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<Posts> {
    return await this.postsService.update(id, updatePostDto);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    return await this.postsService.remove(id);
  }
}
