import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { configure as serverlessExpress } from '@codegenie/serverless-express';
import { AllExceptionsFilter } from '../common/filters/global-exception-filter';
import { HttpAdapterHost } from '@nestjs/core';
import { LoggingInterceptor } from '../common/interceptors/logger.interceptor';

let cachedServer: ReturnType<typeof serverlessExpress>;

async function bootstrap(): Promise<INestApplication> {
  const expressApp = express();
  const adapter = new ExpressAdapter(expressApp);
  const app = await NestFactory.create(AppModule, adapter);

  app.enableCors();

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();
  return app;
}

export const handler = async (event, context, callback) => {
  if (!cachedServer) {
    const nestApp = await bootstrap();
    cachedServer = serverlessExpress({
      app: nestApp.getHttpAdapter().getInstance(),
    });
  }

  return cachedServer(event, context, callback);
};
