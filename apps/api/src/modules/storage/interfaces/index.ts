import { GetObjectCommand } from '@aws-sdk/client-s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl as rawGetSignedUrl } from '@aws-sdk/s3-request-presigner';

export const getSignedUrl = rawGetSignedUrl as (
  client: S3Client,
  command: GetObjectCommand | PutObjectCommand,
  options: { expiresIn?: number },
) => Promise<string>;

export interface PutStorageObjectParams {
  body: Buffer | Uint8Array | string;
  contentLength?: number;
  contentType: string;
  key: string;
}

export interface PresignedUrlParams {
  contentType?: string;
  expiresIn?: number;
  key: string;
}
