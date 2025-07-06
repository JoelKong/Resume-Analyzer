import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { IngestionService } from '../ingestion/ingestion.service';
import { Context, SQSHandler, SQSEvent } from 'aws-lambda';
import { INestApplicationContext } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { S3EventDto } from '../ingestion/dtos/s3.request.dto';

let app: INestApplicationContext;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.createApplicationContext(AppModule);
  }
  return app;
}

export const handler: SQSHandler = async (
  event: SQSEvent,
  context: Context,
) => {
  const application = await bootstrap();
  const ingestionService = application.get(IngestionService);

  for (const record of event.Records) {
    try {
      const s3Event = plainToInstance(S3EventDto, JSON.parse(record.body));
      const errors = await validate(s3Event);
      if (errors.length > 0) {
        console.error('Invalid S3 event format:', errors);
        // Do not throw, as this is a permanent failure.
        continue;
      }
      await ingestionService.processResume(s3Event);
    } catch (error) {
      console.error('Error processing SQS message:', error);
      // Rethrow to enable SQS retry mechanism for transient errors.
      throw error;
    }
  }
};
