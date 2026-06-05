/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { RegisterDto } from './dto/register.dto';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/common/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // Register a user
  async register(registerDto: RegisterDto) {
    const { name, email, password } = registerDto;

    // if email exist or not
    const existing = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existing) {
      throw new ConflictException('This email already has an account!');
    }

    // Password hashing
    const hashedPassword = await bcrypt.hash(password, 10);

    // DB save
    const user = await this.prisma.user.create({
      data: { name, email, password: hashedPassword },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // Generating Token
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user,
      ...tokens,
      message: 'User register is successful!',
    };
  }

  // Login User
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('User not found!');
    }

    // password verification
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Password is incorrect!');
    }

    // Generating Tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      ...tokens,
      message: 'Login is successful!',
    };
  }

  // Get My Profile
  async getProfile(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        age: true,
        createdAt: true,
        _count: { select: { posts: true } },
      },
    });
  }

  // Generating Token (Helper)
  private async generateTokens(userId: number, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      // Access Token
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as any,
      }),

      // Refresh Token
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ?? '30d') as any,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  // Generate Access Token using Refresh Token
  async refreshTokens(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, email: true, role: true },
      });

      if (!user) {
        throw new UnauthorizedException();
      }

      const tokens = await this.generateTokens(user.id, user.email, user.role);

      return {
        ...tokens,
        message: 'Token refreshed successfully!',
      };
    } catch {
      throw new UnauthorizedException('Refresh token is invalid!');
    }
  }
}
