import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Post } from 'src/generated/prisma/client';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new post
  async create(createPostDto: CreatePostDto): Promise<Post> {
    const author = await this.prisma.user.findUnique({
      where: { id: createPostDto.authorId },
    });

    if (!author) {
      throw new NotFoundException('Author not found!');
    }

    return this.prisma.post.create({
      data: createPostDto,
      include: {
        author: { select: { id: true, name: true } },
      },
    });
  }

  // Retrieve all posts
  async findAll(): Promise<Post[]> {
    return await this.prisma.post.findMany({
      include: {
        author: { select: { id: true, name: true } },
      },
    });
  }

  // Retrieve a single post by ID
  async findOne(id: number): Promise<Post> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found!');
    }

    return post;
  }

  // Retrieve published post Only
  async findPublished(): Promise<Post[]> {
    return await this.prisma.post.findMany({
      where: {
        published: true,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  // Post published/unpublished
  async togglePublishedStatus(id: number): Promise<Post> {
    const post = await this.findOne(id);

    return this.prisma.post.update({
      where: { id },
      data: {
        published: !post.published,
      },
    });
  }

  // Update post
  async update(id: number, updatePostDto: UpdatePostDto): Promise<Post> {
    // Search post, if not found throw an error
    await this.findOne(id);

    return await this.prisma.post.update({
      where: { id },
      data: updatePostDto,
    });
  }

  // Delete the post
  async remove(id: number): Promise<{ message: string }> {
    // Search post, if not found throw an error
    await this.findOne(id);

    await this.prisma.post.delete({
      where: { id },
    });

    return { message: 'Post is deleted successfully!' };
  }
}
