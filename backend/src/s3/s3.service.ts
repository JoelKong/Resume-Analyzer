import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get<string>('AWS_REGION');
    this.bucketName = this.configService.get<string>('S3_BUCKET_NAME') ?? '';

    if (!region || !this.bucketName) {
      throw new Error('AWS_REGION and S3_BUCKET_NAME must be configured.');
    }

    this.s3Client = new S3Client({ region });
  }

  async uploadFile(file: Express.Multer.File, key: string): Promise<string> {
    this.logger.log(`Uploading file ${key} to bucket ${this.bucketName}`);
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });
      await this.s3Client.send(command);
      this.logger.log(`Successfully uploaded file ${key} to S3.`);
      return key;
    } catch (error) {
      this.logger.error(`Failed to upload file ${key} to S3`, error.stack);
      throw error;
    }
  }

  async downloadFile(key: string): Promise<Buffer> {
    this.logger.log(`Downloading file ${key} from bucket ${this.bucketName}`);
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      const { Body } = await this.s3Client.send(command);
      if (!Body) {
        throw new Error(`File body is empty for key ${key}.`);
      }
      const chunks: Buffer[] = [];
      for await (const chunk of Body as any) {
        chunks.push(chunk);
      }
      return Buffer.concat(chunks);
    } catch (error) {
      this.logger.error(`Failed to download file ${key} from S3`, error.stack);
      throw error;
    }
  }
}
