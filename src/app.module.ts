/*
 * @Author: leyi leyi@myun.info
 * @Date: 2024-06-25 20:52:38
 * @LastEditors: leyi leyi@myun.info
 * @LastEditTime: 2024-08-07 16:19:58
 * @FilePath: /one-llm-api/src/app.module.ts
 * @Description:
 *
 * Copyright (c) 2024 by ${git_name_email}, All Rights Reserved.
 */
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';

import { join, resolve } from 'path';
import { SignGuard } from '@guard/sign.guard';
import { CustomThrottlerGuard } from '@guard/custom-throttler.guard';

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
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get('app.throttle_ttl'),
          limit: configService.get('app.throttle_limit'),
        },
      ],
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
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
    ConvertionStoreService,
    FileUploadService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {}
}
