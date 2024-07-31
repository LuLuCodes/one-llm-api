/*
 * @Author: leyi leyi@myun.info
 * @Date: 2024-07-26 10:06:03
 * @LastEditors: leyi leyi@myun.info
 * @LastEditTime: 2024-07-31 21:36:11
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
import { ModelFactory } from '@llm-models/model-factory';
import { ChatModel } from '@llm-models/base';
import { ConvertionStoreService } from '@service/convertion-store.service';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { FileUploadService } from '@service/file-loader.service';
import { pathExists, unlinkSync, createReadStream } from 'fs-extra';
import { Observable } from 'rxjs';
import OpenAI from 'openai';
import { uuid } from '@libs/cryptogram';

@Injectable()
export class LlmService {
  constructor(
    private readonly configService: ConfigService,
    private readonly modelFactory: ModelFactory,
    private readonly convertionStoreService: ConvertionStoreService,
    private readonly fileUploadService: FileUploadService,
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
    fileContent,
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
    fileContent?: string;
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

    if (histroyMessages && histroyMessages.length > 0) {
      messages.push(...histroyMessages);
    }
    if (fileContent) {
      const fileMessage: SystemMessage = new SystemMessage(fileContent);
      messages.push(fileMessage);
    }

    let userMessage: HumanMessage = null;
    if (imageBase64) {
      userMessage = new HumanMessage({
        content: [
          { type: 'text', text: userInput },
          {
            type: 'image_url',
            image_url: {
              url: imageBase64,
            },
          },
        ],
      });
    } else {
      userMessage = new HumanMessage(userInput);
    }
    messages.push(userMessage);
    const res = await model.invoke({
      temperature,
      topP,
      maxTokens,
      messages,
    });
    console.log(res);

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
    fileContent,
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
    fileContent?: string;
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

          if (histroyMessages && histroyMessages.length > 0) {
            messages.push(...histroyMessages);
          }
          if (fileContent) {
            const fileMessage: SystemMessage = new SystemMessage(fileContent);
            messages.push(fileMessage);
          }

          let userMessage: HumanMessage = null;
          if (imageBase64) {
            userMessage = new HumanMessage({
              content: [
                { type: 'text', text: userInput },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageBase64,
                  },
                },
              ],
            });
          } else {
            userMessage = new HumanMessage(userInput);
          }
          messages.push(userMessage);

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

  async fileLoader(file: Express.Multer.File) {
    const { docs } = await this.fileUploadService.processFile(file);
    console.log(docs[0]);
    return docs.map((doc) => doc.pageContent).join('\n');
  }

  async fileLoaderByMoonShot(file: Express.Multer.File) {
    const rootDir = process.cwd();
    const uploadDir = this.configService.get<string>('app.upload_dir');
    const moonShotApiKey = this.configService.get<string>(
      'llm.moonshot_api_key',
    );
    const folderPath = path.resolve(rootDir, uploadDir);
    const filePath = `${folderPath}/${file.originalname}`;
    try {
      const exists = await pathExists(filePath);
      if (!exists) {
        throw new Error(`File not found: ${filePath}`);
      }
      const client = new OpenAI({
        apiKey: moonShotApiKey,
        baseURL: 'https://api.moonshot.cn/v1',
      });
      const file_object = await client.files.create({
        file: createReadStream(filePath),
        purpose: 'file-extract' as any,
      });

      const file_content = await (
        await client.files.content(file_object.id)
      ).text();

      return file_content;
    } catch (error) {
      console.error(`Error processing file ${file.originalname}:`, error);
      throw error;
    } finally {
      // Clean up the uploaded file
      unlinkSync(filePath);
    }
  }
}
