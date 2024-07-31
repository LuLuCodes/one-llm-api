/*
 * @Author: leyi leyi@myun.info
 * @Date: 2024-07-26 10:02:42
 * @LastEditors: leyi leyi@myun.info
 * @LastEditTime: 2024-07-31 16:25:32
 * @FilePath: /one-llm-api/src/modules/llm/llm.module.ts
 * @Description:
 *
 * Copyright (c) 2024 by ${git_name_email}, All Rights Reserved.
 */
import { Module } from '@nestjs/common';
import { LlmController } from './llm.controller';
import { LlmService } from './llm.service';
import { ModelFactory } from '@llm-models/model-factory';
import { ConvertionStoreService } from '@service/convertion-store.service';
import { FileUploadService } from '@service/file-loader.service';

@Module({
  controllers: [LlmController],
  providers: [
    LlmService,
    ModelFactory,
    ConvertionStoreService,
    FileUploadService,
  ],
})
export class LlmModule {}
