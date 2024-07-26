/*
 * @Author: leyi leyi@myun.info
 * @Date: 2024-07-26 10:58:51
 * @LastEditors: leyi leyi@myun.info
 * @LastEditTime: 2024-07-26 11:02:06
 * @FilePath: /one-llm-api/src/llm-models/base.ts
 * @Description:Base Chat Model
 *
 * Copyright (c) 2024 by ${git_name_email}, All Rights Reserved.
 */
import { AIMessage, HumanMessage } from '@langchain/core/messages';

export abstract class ChatModel {
  constructor(
    protected readonly apiKey: string,
    protected readonly modelName: string,
  ) {}

  abstract invoke({
    temperature,
    topP,
    maxTokens,
    messages,
  }: {
    temperature?: number;
    topP?: number;
    maxTokens?: number;
    messages: (HumanMessage | AIMessage)[];
  }): any;

  abstract stream({
    temperature,
    topP,
    maxTokens,
    messages,
  }: {
    temperature?: number;
    topP?: number;
    maxTokens?: number;
    messages: (HumanMessage | AIMessage)[];
  }): any;
}
