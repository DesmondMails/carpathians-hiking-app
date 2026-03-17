import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginResponse, SignupResponse } from '@hiking/shared';

import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { SignupDto } from './dto/signup.dto';

import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import type ms from 'ms';
import { LoginUserDto } from './dto/login-user.dto';
import { toPublicUser } from 'src/common/mappers';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendCodeDto } from './dto/resend-code.dto';
import { User } from 'src/prisma/generated/client';
import { GoogleUserPayload } from './interfaces';
import { PrismaService } from 'src/prisma/prisma.service';

const VERIFICATION_CODE_TTL_MS = 15 * 60 * 1000; // 15 minutes

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private prisma: PrismaService,
  ) {}

  async signup(signupDto: SignupDto): Promise<SignupResponse> {
    const { email, password } = signupDto;

    const existing = await this.usersService.findByEmail(email);

    if (existing) {
      throw new ConflictException('Email вже використовується');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await this.usersService.create({
      email,
      password: hashedPassword,
    });

    await this.sendVerificationCode(user.id, email);

    return { email };
  }

  async verifyEmail(dto: VerifyEmailDto): Promise<LoginResponse> {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new NotFoundException('Користувача не знайдено');
    }

    if (user.isEmailVerified) {
      throw new ConflictException('Email вже підтверджено');
    }

    const verification = await this.prisma.emailVerification.findUnique({
      where: { userId: user.id },
    });

    if (!verification) {
      throw new UnauthorizedException(
        'Код підтвердження не знайдено. Запитайте новий.',
      );
    }

    if (verification.expiresAt < new Date()) {
      throw new UnauthorizedException(
        'Код підтвердження застарів. Запитайте новий.',
      );
    }

    const isCodeValid = await bcrypt.compare(dto.code, verification.codeHash);

    if (!isCodeValid) {
      throw new UnauthorizedException('Невірний код підтвердження');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: { isEmailVerified: true },
      }),
      this.prisma.emailVerification.delete({ where: { userId: user.id } }),
    ]);

    const { accessToken, refreshToken } = await this.getTokens(
      user.id,
      user.email,
    );
    await this.updateRefreshToken(user.id, refreshToken);

    return { user: toPublicUser(user), accessToken, refreshToken };
  }

  async resendVerificationCode(dto: ResendCodeDto): Promise<void> {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      // Return silently to avoid email enumeration
      return;
    }

    if (user.isEmailVerified) {
      throw new ConflictException('Email вже підтверджено');
    }

    await this.sendVerificationCode(user.id, user.email);
  }

  async login(loginUserDto: LoginUserDto): Promise<LoginResponse> {
    const { email, password } = loginUserDto;

    const user = await this.validateUserCredentials(email, password);

    if (!user.isEmailVerified) {
      throw new ForbiddenException('Email не підтверджено');
    }

    const { accessToken, refreshToken } = await this.getTokens(
      user.id,
      user.email,
    );
    await this.updateRefreshToken(user.id, refreshToken);

    return { user: toPublicUser(user), accessToken, refreshToken };
  }

  async loginWithGoogle(googleUser: GoogleUserPayload): Promise<LoginResponse> {
    this.logger.log('loginWithGoogle', googleUser);
    if (!googleUser.email) {
      throw new UnauthorizedException('Google email не доступний');
    }

    let user = await this.usersService.findByGoogleId(googleUser.googleId);

    if (!user) {
      user = await this.usersService.findByEmail(googleUser.email);
    }

    if (!user) {
      user = await this.usersService.createGoogleUser({
        email: googleUser.email,
        googleId: googleUser.googleId,
        avatar: googleUser.avatar,
      });
    } else if (!user.googleId) {
      user = await this.usersService.attachGoogleId(
        user.id,
        googleUser.googleId,
      );
    }

    const { accessToken, refreshToken } = await this.getTokens(
      user.id,
      user.email,
    );
    await this.updateRefreshToken(user.id, refreshToken);

    return { user: toPublicUser(user), accessToken, refreshToken };
  }

  async refreshTokens(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<LoginResponse> {
    const { refreshToken } = refreshTokenDto;

    const payload = await this.jwtService.verifyAsync(refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET,
    });

    const user = await this.usersService.findById(payload.sub);

    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Доступ заборонено');
    }

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshTokenHash,
    );

    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Доступ заборонено');
    }

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: toPublicUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.updateHashedRefreshToken(userId, null);
  }

  private async sendVerificationCode(
    userId: string,
    email: string,
  ): Promise<void> {
    const code = crypto.randomInt(100000, 999999).toString();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + VERIFICATION_CODE_TTL_MS);

    await this.prisma.emailVerification.upsert({
      where: { userId },
      create: { userId, codeHash, expiresAt },
      update: { codeHash, expiresAt },
    });

    await this.emailService.sendVerificationCode(email, code);
  }

  private async updateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateHashedRefreshToken(
      userId,
      hashedRefreshToken,
    );
  }

  private async getTokens(
    userId: string,
    email: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { sub: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION as ms.StringValue,
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION as ms.StringValue,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async validateUserCredentials(
    email: string,
    password: string,
  ): Promise<User> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Неправильний email або пароль');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password!);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Неправильний email або пароль');
    }

    return user;
  }
}
