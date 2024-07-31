/*
 * @Author: leyi leyi@myun.info
 * @Date: 2024-06-25 20:52:38
 * @LastEditors: leyi leyi@myun.info
 * @LastEditTime: 2024-07-26 14:12:56
 * @FilePath: /one-llm-api/src/app.module.ts
 * @Description:
 *
 * Copyright (c) 2024 by ${git_name_email}, All Rights Reserved.
 */
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';

import { join, resolve } from 'path';
import { SignGuard } from '@guard/sign.guard';

import { InitModule } from './init.module';
import { LlmModule } from '@modules/llm/llm.module';

import { ConvertionStoreService } from '@service/convertion-store.service';
import { FileUploadService } from '@service/file-loader.service';

import app_config from '@config/app';
import redis_config from '@config/redis';
import while_list from '@config/white-list';
import llm from '@config/llm';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [app_config, redis_config, while_list, llm],
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'www'),
      exclude: ['/api*'],
    }),
    HttpModule.registerAsync({
      useFactory: async () => ({
        timeout: 10000,
        maxRedirects: 5,
      }),
    }),
    InitModule,
    LlmModule,
    ScheduleModule.forRoot(),
  ],
  providers: [
    // {
    //   provide: APP_GUARD,
    //   useClass: SignGuard,
    // },
    ConvertionStoreService,
    FileUploadService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {}
}
