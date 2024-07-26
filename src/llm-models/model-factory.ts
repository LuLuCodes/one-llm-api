/*
 * @Author: leyi leyi@myun.info
 * @Date: 2024-07-25 16:57:55
 * @LastEditors: leyi leyi@myun.info
 * @LastEditTime: 2024-07-26 14:32:29
 * @FilePath: /one-llm-api/src/llm-models/model-factory.ts
 * @Description:
 *
 * Copyright (c) 2024 by ${git_name_email}, All Rights Reserved.
 */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatZhipu } from '@llm-models/zhipu';

@Injectable()
export class ModelFactory {
  constructor(private configService: ConfigService) {}

  createModel({
    modelType,
    modelName,
  }: {
    modelType: string;
    modelName: string;
  }) {
    switch (modelType) {
      case 'zhipu':
        return new ChatZhipu(
          this.configService.get<string>('llm.zhipu_api_key'),
          modelName,
        );
      default:
        throw new Error(`Unsupported model type: ${modelType}`);
    }
  }
}
