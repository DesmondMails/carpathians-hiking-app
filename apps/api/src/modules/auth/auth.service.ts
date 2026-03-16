import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PublicUser, LoginResponse } from '@hiking/shared';

import { UsersService } from '../users/users.service';
import { SignupDto } from './dto/signup.dto';

import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { toPublicUser } from 'src/common/mappers';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto): Promise<PublicUser> {
    const { email, password } = signupDto;

    const user = await this.usersService.findOne(email);

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

    const user = await this.usersService.findOne(email);

    if (!user) {
      throw new UnauthorizedException('Неправильний email або пароль');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Неправильний email або пароль');
    }

    const payload = { sub: user.id, email: user.email };

    return {
      user: toPublicUser(user),
      accessToken: this.jwtService.sign(payload),
    };
  }
}
