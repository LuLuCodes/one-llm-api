/*
 * @Author: leyi leyi@myun.info
 * @Date: 2024-07-25 16:57:55
 * @LastEditors: leyi leyi@myun.info
 * @LastEditTime: 2024-08-29 11:20:08
 * @FilePath: /one-llm-api/src/llm-models/model-factory.ts
 * @Description:
 *
 * Copyright (c) 2024 by ${git_name_email}, All Rights Reserved.
 */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ZhipuAI } from '@llm-models/zhipu';
import { MoonshotAI } from '@llm-models/moonshot';
import { OpenAI } from '@llm-models/openai';

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
        return new ZhipuAI(
          this.configService.get<string>('llm.zhipu_api_key'),
          modelName,
        );
      case 'moonshot':
        return new MoonshotAI(
          this.configService.get<string>('llm.moonshot_api_key'),
          modelName,
        );
      case 'openai':
        return new OpenAI(
          this.configService.get<string>('llm.deep_bricks_api_key'),
          modelName,
        );
      default:
        throw new Error(`Unsupported model type: ${modelType}`);
    }
  }
}
