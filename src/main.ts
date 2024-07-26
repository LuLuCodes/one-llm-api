/*
 * @Author: leyi leyi@myun.info
 * @Date: 2024-06-25 20:52:38
 * @LastEditors: leyi leyi@myun.info
 * @LastEditTime: 2024-07-25 16:43:51
 * @FilePath: /one-llm-api/src/main.ts
 * @Description:
 *
 * Copyright (c) 2024 by ${git_name_email}, All Rights Reserved.
 */
import { NestFactory } from '@nestjs/core';
// import { VersioningType } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

import { AllExceptionsFilter } from '@filter/all-exception.filter';
import { TransformInterceptor } from '@interceptor/transform.interceptor';
import { LoggingInterceptor } from '@interceptor/logging.interceptor';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import bodyParserXml from 'body-parser-xml';
import compression from 'compression';
import multer from 'multer';

bodyParserXml(bodyParser);

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);
  app.setGlobalPrefix('api');
  app.use(function (req, res, next) {
    const headers = req.headers['content-type'];
    if (headers && headers.indexOf('utf8') > -1) {
      req.headers['content-type'] = headers.replace('utf8', 'utf-8');
    }
    next();
  });

  if (config.get('app.node_env') === 'production') {
    app.use(helmet());
  }
  app.enableCors({
    origin: true,
    allowedHeaders:
      'Content-Type, X-XSRF-Token, CSRF-Token, X-CSRF-Token, X-Auth-Token',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });
  app.use(compression());
  app.use(multer().any());
  app.use(bodyParser.json({ limit: '50mb' })); // For parsing application/json
  app.use(
    bodyParser.urlencoded({
      limit: '50mb',
      extended: false,
    }),
  ); // For parsing application/x-www-form-urlencoded
  app.use(
    bodyParser.xml({
      xmlParseOptions: {
        explicitArray: false, // 始终返回数组。默认情况下只有数组元素数量大于 1 是才返回数组。
      },
    }),
  );

  app.use(cookieParser());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalInterceptors(new LoggingInterceptor());
  // `Header`版本控制
  // app.enableVersioning({ type: VersioningType.HEADER, header: 'version' });
  await app.listen(config.get('app.port'));
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
