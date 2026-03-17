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
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { LoginResponse, SignupResponse } from '@hiking/shared';
import { LoginUserDto } from './dto/login-user.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendCodeDto } from './dto/resend-code.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { User } from 'src/prisma/generated/client';
import { GoogleUserPayload } from './interfaces';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {}

  @Public()
  @Post('signup')
  async signup(@Body() signupDto: SignupDto): Promise<SignupResponse> {
    return this.authService.signup(signupDto);
  }

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('verify-email')
  async verifyEmail(@Body() dto: VerifyEmailDto): Promise<LoginResponse> {
    return this.authService.verifyEmail(dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Public()
  @Post('resend-code')
  async resendCode(@Body() dto: ResendCodeDto): Promise<void> {
    return this.authService.resendVerificationCode(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('login')
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
    this.logger.log('googleRedirect', req.user);
    return this.authService.loginWithGoogle(req.user);
  }

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<LoginResponse> {
    return this.authService.refreshTokens(refreshTokenDto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  async logout(@CurrentUser() user: User): Promise<void> {
    return this.authService.logout(user.id);
  }
}
