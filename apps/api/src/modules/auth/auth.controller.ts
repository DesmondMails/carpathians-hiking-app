import { LoginResponse, SignupResponse } from '@hiking/shared';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import type { User } from 'src/prisma/generated/client';

import { AuthService } from './auth.service';
import { GoogleNativeDto } from './dto/google-native.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResendCodeDto } from './dto/resend-code.dto';
import { SignupDto } from './dto/signup.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { GoogleUserPayload } from './interfaces';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {}

  @Public()
  @Post('signup')
  @ApiOperation({ summary: 'Зареєструватися' })
  @ApiResponse({
    status: 201,
    description:
      'Користувач успішно зареєстрований, потрібно підтвердити email',
  })
  @ApiResponse({ status: 409, description: 'Email вже використовується' })
  async signup(@Body() signupDto: SignupDto): Promise<SignupResponse> {
    return this.authService.signup(signupDto);
  }

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('verify-email')
  @ApiOperation({ summary: 'Підтвердити email' })
  @ApiResponse({ status: 200, description: 'Email успішно підтверджено' })
  @ApiResponse({
    status: 401,
    description: 'Код підтвердження не валідний або застарів',
  })
  @ApiResponse({ status: 404, description: 'Користувача не знайдено' })
  async verifyEmail(@Body() dto: VerifyEmailDto): Promise<LoginResponse> {
    return this.authService.verifyEmail(dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Public()
  @Post('resend-code')
  @ApiOperation({ summary: 'Повторно надіслати код підтвердження' })
  @ApiResponse({
    status: 200,
    description: 'Код підтвердження успішно надіслано',
  })
  @ApiResponse({ status: 404, description: 'Користувача не знайдено' })
  async resendCode(@Body() dto: ResendCodeDto): Promise<void> {
    return this.authService.resendVerificationCode(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Увійти' })
  @ApiResponse({ status: 200, description: 'Користувач успішно увійшов' })
  @ApiResponse({ status: 401, description: 'Невірні email або пароль' })
  async login(@Body() loginUserDto: LoginUserDto): Promise<LoginResponse> {
    return this.authService.login(loginUserDto);
  }

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {}

  @Public()
  @UseGuards(AuthGuard('google'))
  @Get('google/redirect')
  async googleRedirect(
    @Req() req: Request & { user: GoogleUserPayload },
  ): Promise<LoginResponse> {
    return this.authService.loginWithGoogleOrCreate(req.user);
  }

  @Public()
  @Post('google/native')
  @ApiOperation({ summary: 'Увійти за допомогою Google Native' })
  @ApiResponse({ status: 200, description: 'Користувач успішно увійшов' })
  @ApiResponse({ status: 401, description: 'Невірні email або пароль' })
  async googleNative(@Body() dto: GoogleNativeDto): Promise<LoginResponse> {
    return this.authService.loginWithGoogleNative(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Оновити токен' })
  @ApiResponse({ status: 200, description: 'Токен успішно оновлено' })
  @ApiResponse({ status: 401, description: 'Невірний refresh токен' })
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<LoginResponse> {
    return this.authService.refreshTokens(refreshTokenDto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  @ApiOperation({ summary: 'Вийти' })
  @ApiResponse({ status: 204, description: 'Користувач успішно вийшов' })
  async logout(@CurrentUser() user: User): Promise<void> {
    return this.authService.logout(user.id);
  }
}
