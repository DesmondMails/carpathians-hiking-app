import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { User } from 'src/prisma/generated/client';
import { PrismaService } from 'src/prisma/prisma.service';

import { AuthService } from './auth.service';
import { EmailService } from '../email/email.service';
import { UsersService } from '../users/users.service';

const PASSWORD = 'Password1';

const config: Record<string, string> = {
  JWT_SECRET: 'access-secret',
  JWT_ACCESS_TOKEN_EXPIRATION: '15m',
  JWT_REFRESH_TOKEN_SECRET: 'refresh-secret',
  JWT_REFRESH_TOKEN_EXPIRATION: '7d',
};

describe('AuthService refresh tokens', () => {
  let user: User;
  let service: AuthService;
  let now: number;

  // JWTs have second-granularity iat/exp, so tokens issued in the same
  // second are byte-identical; move the clock forward between issues
  const advanceClock = () => {
    now += 1000;
  };

  const login = async () =>
    (await service.login({ email: user.email, password: PASSWORD }))
      .refreshToken;

  beforeEach(async () => {
    now = Date.now();
    jest.spyOn(Date, 'now').mockImplementation(() => now);

    user = {
      id: '3f2b8c1e-9a4d-4e7b-8c6a-1d2e3f4a5b6c',
      email: 'hiker@example.com',
      name: null,
      password: await bcrypt.hash(PASSWORD, 4),
      refreshTokenHash: null,
      googleId: null,
      authProvider: 'EMAIL',
      isEmailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      avatar: null,
    };

    const usersService = {
      findByEmail: jest.fn((email: string) =>
        Promise.resolve(email === user.email ? user : null),
      ),
      findById: jest.fn((id: string) =>
        Promise.resolve(id === user.id ? user : null),
      ),
      updateHashedRefreshToken: jest.fn(
        (_id: string, refreshTokenHash: string | null) => {
          user = { ...user, refreshTokenHash };
          return Promise.resolve();
        },
      ),
    };

    service = new AuthService(
      usersService as unknown as UsersService,
      new JwtService({}),
      {} as EmailService,
      {} as PrismaService,
      { getOrThrow: (key: string) => config[key] } as ConfigService,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('issues refresh tokens sharing a 72-byte prefix (bcrypt truncation precondition)', async () => {
    const first = await login();
    advanceClock();
    const second = await login();

    expect(first).not.toBe(second);
    expect(first.slice(0, 72)).toBe(second.slice(0, 72));
  });

  it('rejects a refresh token after it has been rotated', async () => {
    const original = await login();
    advanceClock();
    const { refreshToken: rotated } = await service.refreshTokens({
      refreshToken: original,
    });

    await expect(
      service.refreshTokens({ refreshToken: original }),
    ).rejects.toThrow(UnauthorizedException);

    advanceClock();
    await expect(
      service.refreshTokens({ refreshToken: rotated }),
    ).resolves.toHaveProperty('refreshToken');
  });

  it('does not revive a pre-logout refresh token after logging in again', async () => {
    const beforeLogout = await login();
    await service.logout(user.id);

    await expect(
      service.refreshTokens({ refreshToken: beforeLogout }),
    ).rejects.toThrow(UnauthorizedException);

    advanceClock();
    const afterRelogin = await login();

    await expect(
      service.refreshTokens({ refreshToken: beforeLogout }),
    ).rejects.toThrow(UnauthorizedException);
    await expect(
      service.refreshTokens({ refreshToken: afterRelogin }),
    ).resolves.toHaveProperty('refreshToken');
  });

  it('rejects tokens stored under the legacy bcrypt hash without throwing a 500', async () => {
    const token = await login();
    user = { ...user, refreshTokenHash: await bcrypt.hash(token, 4) };

    await expect(
      service.refreshTokens({ refreshToken: token }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
