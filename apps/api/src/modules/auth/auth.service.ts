import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PublicUser, LoginResponse } from '@hiking/shared';

import { UsersService } from '../users/users.service';
import { SignupDto } from './dto/signup.dto';

import * as bcrypt from 'bcrypt';
import type ms from 'ms';
import { LoginUserDto } from './dto/login-user.dto';
import { toPublicUser } from 'src/common/mappers';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { User } from 'src/prisma/generated/client';
import { GoogleUserPayload } from './interfaces';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto): Promise<PublicUser> {
    const { email, password } = signupDto;

    const user = await this.usersService.findByEmail(email);

    if (user) {
      throw new ConflictException('Email already in use');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const createdUser = await this.usersService.create({
      email,
      password: hashedPassword,
    });

    return toPublicUser(createdUser);
  }

  async login(loginUserDto: LoginUserDto): Promise<LoginResponse> {
    const { email, password } = loginUserDto;

    const user = await this.validateUserCredentials(email, password);

    const { accessToken, refreshToken } = await this.getTokens(
      user.id,
      user.email,
    );

    await this.updateRefreshToken(user.id, refreshToken);

    return {
      user: toPublicUser(user),
      accessToken,
      refreshToken,
    };
  }

  async loginWithGoogle(googleUser: GoogleUserPayload): Promise<LoginResponse> {
    this.logger.log('loginWithGoogle', googleUser);
    if (!googleUser.email) {
      throw new UnauthorizedException('Google email is not available');
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

    return {
      user: toPublicUser(user),
      accessToken,
      refreshToken,
    };
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
      throw new UnauthorizedException('Access denied');
    }

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshTokenHash,
    );

    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Access denied');
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
    const payload = {
      sub: userId,
      email,
    };

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

    return {
      accessToken,
      refreshToken,
    };
  }

  private async validateUserCredentials(
    email: string,
    password: string,
  ): Promise<User> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Неправильний email або пароль');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Неправильний email або пароль');
    }

    return user;
  }
}
