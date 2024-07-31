/*
 * @Author: leyi leyi@myun.info
 * @Date: 2024-07-25 18:54:18
 * @LastEditors: leyi leyi@myun.info
 * @LastEditTime: 2024-07-31 21:00:50
 * @FilePath: /one-llm-api/src/llm-models/zhipu.ts
 * @Description:
 *
 * Copyright (c) 2024 by ${git_name_email}, All Rights Reserved.
 */
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from '@langchain/core/messages';
import { ChatZhipuAI } from '@langchain/community/chat_models/zhipuai';
import { ChatModel } from './base';

export class ZhipuAI extends ChatModel {
  constructor(apiKey: string, modelName: string) {
    super(apiKey, modelName);
  }

  async invoke({
    temperature = 0.95,
    maxTokens = 1024,
    messages,
  }: {
    temperature?: number;
    topP?: number;
    maxTokens?: number;
    messages: (HumanMessage | AIMessage | SystemMessage)[];
  }) {
    const glm = new ChatZhipuAI({
      model: this.modelName,
      temperature,
      maxTokens,
      streaming: false,
      zhipuAIApiKey: this.apiKey,
    });

    return await glm.invoke(messages);
  }

  async stream({
    temperature = 0.95,
    maxTokens = 1024,
    messages,
  }: {
    temperature?: number;
    topP?: number;
    maxTokens?: number;
    messages: (HumanMessage | AIMessage | SystemMessage)[];
  }) {
    const glm = new ChatZhipuAI({
      model: this.modelName,
      temperature,
      maxTokens,
      streaming: true,
      zhipuAIApiKey: this.apiKey,
    });

    return await glm.stream(messages);
  }
}
