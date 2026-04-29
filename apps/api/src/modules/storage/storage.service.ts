import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  getSignedUrl,
  PutStorageObjectParams,
  PresignedUrlParams,
} from './interfaces';

@Injectable()
export class StorageService {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly endpoint: string;
  private readonly publicBaseUrl?: string;
  private readonly defaultPresignedTtlSeconds: number;
  private readonly logger = new Logger(StorageService.name);

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.getRequiredConfig('R2_BUCKET');
    this.endpoint = this.getRequiredConfig('R2_ENDPOINT');
    this.publicBaseUrl =
      this.configService.get<string>('R2_PUBLIC_BASE_URL')?.trim() || undefined;
    this.defaultPresignedTtlSeconds = this.getNumberConfig(
      'R2_PRESIGNED_URL_TTL_SECONDS',
      900,
    );

    this.s3 = new S3Client({
      region: this.configService.get<string>('R2_REGION') || 'auto',
      endpoint: this.endpoint,
      credentials: {
        accessKeyId: this.getRequiredConfig('R2_ACCESS_KEY_ID'),
        secretAccessKey: this.getRequiredConfig('R2_SECRET_ACCESS_KEY'),
      },
    });

    this.logger.log(`Storage client initialized for bucket "${this.bucket}"`);
  }

  async putObject({
    key,
    body,
    contentType,
    contentLength,
  }: PutStorageObjectParams): Promise<void> {
    console.dir('putObject', { key, body, contentType, contentLength });
    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: body,
          ContentType: contentType,
          ContentLength: contentLength,
        }),
      );
    } catch (error) {
      this.logger.error(`Failed to upload object "${key}"`, error);
      throw new InternalServerErrorException(
        'Не вдалося зберегти файл у сховищі',
      );
    }
  }

  async deleteObject(key: string): Promise<void> {
    try {
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
    } catch (error) {
      this.logger.error(`Failed to delete object "${key}"`, error);
      throw new InternalServerErrorException(
        'Не вдалося видалити файл зі сховища',
      );
    }
  }

  async createPresignedUploadUrl({
    key,
    contentType,
    expiresIn,
  }: PresignedUrlParams): Promise<string> {
    try {
      return await getSignedUrl(
        this.s3,
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          ContentType: contentType,
        }),
        {
          expiresIn: expiresIn ?? this.defaultPresignedTtlSeconds,
        },
      );
    } catch (error) {
      this.logger.error(`Failed to create upload URL for "${key}"`, error);
      throw new InternalServerErrorException(
        'Не вдалося створити посилання для завантаження файлу',
      );
    }
  }

  async createPresignedDownloadUrl({
    key,
    expiresIn,
  }: PresignedUrlParams): Promise<string> {
    try {
      return await getSignedUrl(
        this.s3,
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
        {
          expiresIn: expiresIn ?? this.defaultPresignedTtlSeconds,
        },
      );
    } catch (error) {
      this.logger.error(`Failed to create download URL for "${key}"`, error);
      throw new InternalServerErrorException(
        'Не вдалося створити посилання для отримання файлу',
      );
    }
  }

  getPublicUrl(key: string): string | null {
    if (!this.publicBaseUrl) {
      return null;
    }

    return `${this.publicBaseUrl.replace(/\/+$/, '')}/${key}`;
  }

  buildDraftGpxKey(userId: string, draftId: string): string {
    return `draft-gpx/${userId}/${draftId}.gpx`;
  }

  buildDraftImageKey(
    draftId: string,
    imageId: string,
    extension: string,
  ): string {
    return `drafts/${draftId}/images/${imageId}.${this.normalizeExtension(extension)}`;
  }

  buildRouteImageKey(
    routeId: string,
    imageId: string,
    extension: string,
  ): string {
    return `routes/${routeId}/images/${imageId}.${this.normalizeExtension(extension)}`;
  }

  private getRequiredConfig(key: string): string {
    const value = this.configService.get<string>(key)?.trim();

    if (!value) {
      throw new Error(`Missing required config: ${key}`);
    }

    return value;
  }

  private getNumberConfig(key: string, fallback: number): number {
    const value = this.configService.get<string>(key);

    if (!value) {
      return fallback;
    }

    const parsed = Number(value);

    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  private normalizeExtension(extension: string): string {
    return extension.replace(/^\./, '').toLowerCase();
  }
}
