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
    const { tags, ...postData } = createPostDto;
    const author = await this.prisma.user.findUnique({
      where: { id: createPostDto.authorId },
    });

    if (!author) {
      throw new NotFoundException('Author not found!');
    }

    return this.prisma.post.create({
      data: {
        ...postData,
        tags: {
          // This maps your ["tag1", "tag2"] into the Prisma format
          connectOrCreate: tags?.map((tag) => ({
            where: {
              name: tag,
            },
            create: {
              name: tag,
            },
          })),
        },
      },
      include: {
        author: { select: { id: true, name: true } },
        tags: true,
      },
    });
  }

  // Retrieve all posts
  async findAll(search?: string): Promise<Post[]> {
    return await this.prisma.post.findMany({
      // searching by title
      where: search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { content: { contains: search, mode: 'insensitive' } },
              {
                tags: {
                  some: {
                    name: { contains: search, mode: 'insensitive' },
                  },
                },
              },
            ],
          }
        : undefined,
      include: {
        author: { select: { id: true, name: true } },
        tags: true,
      },
    });
  }

  // Retrieve published post Only
  async findPublished(search?: string): Promise<Post[]> {
    return await this.prisma.post.findMany({
      where: {
        published: true,
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
                {
                  tags: {
                    some: {
                      name: { contains: search, mode: 'insensitive' },
                    },
                  },
                },
              ],
            }
          : undefined),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        tags: true,
      },
    });
  }

  // Retrieve a single post by ID
  async findOne(id: number): Promise<Post> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, email: true } },
        tags: true,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found!');
    }

    return post;
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

    const { tags, ...postData } = updatePostDto;

    return await this.prisma.post.update({
      where: { id },
      data: {
        ...postData,
        tags: tags
          ? {
              // 'set: []' clears existing relations so it can replace them
              // 'connectOrCreate' ensures we don't get errors for tags that already exist in the DB
              set: [],
              connectOrCreate: tags?.map((tag) => ({
                where: { name: tag },
                create: { name: tag },
              })),
            }
          : undefined,
      },
      include: {
        author: {
          select: {
            id: true,
          },
        },
        tags: true,
      },
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
