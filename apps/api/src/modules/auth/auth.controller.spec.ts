import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import request from 'supertest';
import { App } from 'supertest/types';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController throttling', () => {
  let app: INestApplication<App>;
  const authService = {
    verifyEmail: jest.fn(),
    login: jest.fn(),
    resendVerificationCode: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot({ throttlers: [{ ttl: 60000, limit: 10 }] }),
      ],
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it.each([
    ['verify-email', 200, authService.verifyEmail],
    ['login', 200, authService.login],
    ['resend-code', 204, authService.resendVerificationCode],
  ])(
    'blocks the 6th /auth/%s request within a minute',
    async (path, okStatus, handler) => {
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post(`/auth/${path}`)
          .send({})
          .expect(okStatus);
      }

      await request(app.getHttpServer())
        .post(`/auth/${path}`)
        .send({})
        .expect(429);
      expect(handler).toHaveBeenCalledTimes(5);
    },
  );

  it('does not let a spoofed X-Forwarded-For reset the limit', async () => {
    for (let i = 0; i < 5; i++) {
      await request(app.getHttpServer())
        .post('/auth/verify-email')
        .set('X-Forwarded-For', `203.0.113.${i}`)
        .send({})
        .expect(200);
    }

    await request(app.getHttpServer())
      .post('/auth/verify-email')
      .set('X-Forwarded-For', '203.0.113.99')
      .send({})
      .expect(429);
  });
});
