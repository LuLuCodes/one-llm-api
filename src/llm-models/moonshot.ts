/*
 * @Author: leyi leyi@myun.info
 * @Date: 2024-07-25 18:54:18
 * @LastEditors: leyi leyi@myun.info
 * @LastEditTime: 2024-07-26 14:15:30
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
import { ChatMoonshot } from '@langchain/community/chat_models/moonshot';
import { ChatModel } from './base';

export class MoonshotAI extends ChatModel {
  constructor(apiKey: string, modelName: string) {
    super(apiKey, modelName);
  }

  async invoke({
    temperature = 0,
    topP = 1,
    maxTokens = 2048,
    messages,
  }: {
    temperature?: number;
    topP?: number;
    maxTokens?: number;
    messages: (HumanMessage | AIMessage | SystemMessage)[];
  }) {
    const moonshot = new ChatMoonshot({
      model: this.modelName,
      temperature,
      topP,
      maxTokens,
      streaming: false,
      apiKey: this.apiKey,
    });

    return await moonshot.invoke(messages);
  }

  async stream({
    temperature = 0,
    topP = 1,
    maxTokens = 2048,
    messages,
  }: {
    temperature?: number;
    topP?: number;
    maxTokens?: number;
    messages: (HumanMessage | AIMessage | SystemMessage)[];
  }) {
    const moonshot = new ChatMoonshot({
      model: this.modelName,
      temperature,
      topP,
      maxTokens,
      streaming: false,
      apiKey: this.apiKey,
    });

    return await moonshot.stream(messages);
  }
}
