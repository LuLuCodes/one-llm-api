/*
 * @Author: leyi leyi@myun.info
 * @Date: 2024-07-25 18:54:18
 * @LastEditors: leyi leyi@myun.info
 * @LastEditTime: 2024-08-29 09:55:22
 * @FilePath: /deep-ai-health-ai-task-service/src/llm-models/openai.ts
 * @Description:
 *
 * Copyright (c) 2024 by ${git_name_email}, All Rights Reserved.
 */
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { ChatModel } from './base';

export class OpenAI extends ChatModel {
  constructor(apiKey: string, modelName: string) {
    super(apiKey, modelName);
  }

  async invoke({
    temperature = 0.5,
    topP = 0.85,
    frequency_penalty = 0.3,
    presence_penalty = 0.3,
    maxTokens = 1024,
    messages,
  }: {
    temperature?: number;
    topP?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
    maxTokens?: number;
    messages: (HumanMessage | AIMessage | SystemMessage)[];
  }) {
    const openai = new ChatOpenAI({
      model: this.modelName,
      temperature,
      topP,
      frequencyPenalty: frequency_penalty,
      presencePenalty: presence_penalty,
      maxTokens,
      streaming: false,
      openAIApiKey: this.apiKey,
      configuration: {
        baseURL: 'https://api.deepbricks.ai/v1/',
      },
    });

    return await openai.invoke(messages);
  }

  async stream({
    temperature = 0.5,
    topP = 0.85,
    frequency_penalty = 0.3,
    presence_penalty = 0.3,
    maxTokens = 1024,
    messages,
  }: {
    temperature?: number;
    topP?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
    maxTokens?: number;
    messages: (HumanMessage | AIMessage | SystemMessage)[];
  }) {
    const openai = new ChatOpenAI({
      model: this.modelName,
      temperature,
      topP,
      frequencyPenalty: frequency_penalty,
      presencePenalty: presence_penalty,
      maxTokens,
      streaming: true,
      openAIApiKey: this.apiKey,
      configuration: {
        baseURL: 'https://your_custom_url.com',
      },
    });

    return await openai.stream(messages);
  }
}
