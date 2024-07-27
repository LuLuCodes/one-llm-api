/*
 * @Author: leyi leyi@myun.info
 * @Date: 2024-07-26 10:06:03
 * @LastEditors: leyi leyi@myun.info
 * @LastEditTime: 2024-07-27 14:37:57
 * @FilePath: /one-llm-api/src/modules/llm/llm.service.ts
 * @Description:
 *
 * Copyright (c) 2024 by ${git_name_email}, All Rights Reserved.
 */
import { Injectable } from '@nestjs/common';
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from '@langchain/core/messages';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { ModelFactory } from '@llm-models/model-factory';
import { ChatModel } from '@llm-models/base';
import { ConvertionStoreService } from '@service/convertion-store.service';
import { Observable } from 'rxjs';

import { uuid } from '@libs/cryptogram';
import { getAbsolutePath } from '@libs/util';

@Injectable()
export class LlmService {
  constructor(
    private readonly modelFactory: ModelFactory,
    private readonly convertionStoreService: ConvertionStoreService,
  ) {}

  async processBlockResponse({
    convertionId,
    systemPrompt,
    imageBase64,
    userInput,
    modelType,
    modelName,
    temperature,
    topP,
    maxTokens,
  }: {
    convertionId: string;
    systemPrompt?: string;
    imageBase64?: string;
    userInput: string;
    modelType: string;
    modelName: string;
    temperature?: number;
    topP?: number;
    maxTokens?: number;
  }): Promise<any> {
    const model: ChatModel = this.modelFactory.createModel({
      modelType,
      modelName,
    });
    const retrievedMessages =
      await this.convertionStoreService.getConversation(convertionId);
    const histroyMessages = retrievedMessages.map((item) => {
      const message = JSON.parse(item);
      if (message.id.includes('AIMessage')) {
        return new AIMessage({ ...message.kwargs });
      } else {
        return new HumanMessage({ ...message.kwargs });
      }
    });

    const messages =
      !convertionId && systemPrompt ? [new SystemMessage(systemPrompt)] : [];
    const userMessage: HumanMessage = new HumanMessage({
      content: imageBase64
        ? [
            { type: 'text', text: userInput },
            {
              type: 'image_url',
              image_url: {
                url: imageBase64,
              },
            },
          ]
        : [{ type: 'text', text: userInput }],
    });
    messages.push(...histroyMessages, userMessage);
    const res = await model.invoke({
      temperature,
      topP,
      maxTokens,
      messages,
    });

    const newConversionId = convertionId || uuid();

    await this.convertionStoreService.storeConversation({
      convertionId: newConversionId,
      messages: [...messages, res],
    });
    return {
      convertionId: newConversionId,
      content: res.content,
      response_metadata: res.response_metadata,
    };
  }

  processStreamResponse({
    convertionId,
    systemPrompt,
    imageBase64,
    userInput,
    modelType,
    modelName,
    temperature,
    topP,
    maxTokens,
  }: {
    convertionId: string;
    systemPrompt?: string;
    imageBase64?: string;
    userInput: string;
    modelType: string;
    modelName: string;
    temperature?: number;
    topP?: number;
    maxTokens?: number;
  }): Observable<string> {
    return new Observable<string>((observer) => {
      (async () => {
        try {
          const model: ChatModel = this.modelFactory.createModel({
            modelType,
            modelName,
          });
          const retrievedMessages =
            await this.convertionStoreService.getConversation(convertionId);
          const histroyMessages = retrievedMessages.map((item) => {
            const message = JSON.parse(item);
            if (message.id.includes('AIMessage')) {
              return new AIMessage({ ...message.kwargs });
            } else {
              return new HumanMessage({ ...message.kwargs });
            }
          });

          const messages =
            !convertionId && systemPrompt
              ? [new SystemMessage(systemPrompt)]
              : [];
          const userMessage: HumanMessage = new HumanMessage({
            content: imageBase64
              ? [
                  { type: 'text', text: userInput },
                  { type: 'image_url', image_url: imageBase64 },
                ]
              : [{ type: 'text', text: userInput }],
          });
          messages.push(...histroyMessages, userMessage);

          const stream = await model.stream({
            temperature,
            topP,
            maxTokens,
            messages,
          });

          const newConversionId = convertionId || uuid();
          let finalChunk = null;
          for await (const chunk of stream) {
            const { content } = chunk;
            finalChunk = finalChunk ? finalChunk.concat(chunk) : chunk;
            observer.next(
              JSON.stringify({
                convertionId: newConversionId,
                content,
              }),
            );
          }

          await this.convertionStoreService.storeConversation({
            convertionId: newConversionId,
            messages: [...messages, new AIMessage({ ...finalChunk })],
          });
          observer.complete();
        } catch (error) {
          observer.error(error);
        }
      })();
    });
  }

  async fileLoader() {
    // 根据相对路径获取文件绝对路径

    const filePath = getAbsolutePath('../../20240711.docx');
    console.log(filePath);
    const loader = new DocxLoader(filePath);

    const docs = await loader.load();

    console.log(docs);
  }
}
