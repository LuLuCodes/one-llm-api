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
import { AIMessage, HumanMessage } from '@langchain/core/messages';
import { ChatZhipuAI } from '@langchain/community/chat_models/zhipuai';
import { ChatModel } from './base';

export class ChatZhipu extends ChatModel {
  constructor(apiKey: string, modelName: string) {
    super(apiKey, modelName);
  }

  async invoke({
    temperature = 0.75,
    topP = 0.7,
    maxTokens = 2048,
    messages,
  }: {
    temperature?: number;
    topP?: number;
    maxTokens?: number;
    messages: (HumanMessage | AIMessage)[];
  }) {
    const glm = new ChatZhipuAI({
      model: this.modelName,
      temperature,
      topP,
      maxTokens,
      streaming: false,
      zhipuAIApiKey: this.apiKey,
    });

    return await glm.invoke(messages);
  }

  async stream({
    temperature = 0.75,
    topP = 0.7,
    maxTokens = 2048,
    messages,
  }: {
    temperature?: number;
    topP?: number;
    maxTokens?: number;
    messages: (HumanMessage | AIMessage)[];
  }) {
    const glm = new ChatZhipuAI({
      model: this.modelName,
      temperature,
      topP,
      maxTokens,
      streaming: true,
      zhipuAIApiKey: this.apiKey,
    });

    return await glm.stream(messages);
  }
}
