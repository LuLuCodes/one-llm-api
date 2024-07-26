/*
 * @Author: leyi leyi@myun.info
 * @Date: 2024-07-25 18:25:16
 * @LastEditors: leyi leyi@myun.info
 * @LastEditTime: 2024-07-26 15:09:45
 * @FilePath: /one-llm-api/src/service/convertion-store.service.ts
 * @Description:
 *
 * Copyright (c) 2024 by ${git_name_email}, All Rights Reserved.
 */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { RedisByteStore } from '@langchain/community/storage/ioredis';
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from '@langchain/core/messages';

@Injectable()
export class ConvertionStoreService {
  private readonly redisClient: Redis;
  private readonly redisStore: RedisByteStore;
  private readonly encoder: TextEncoder;
  private readonly decoder: TextDecoder;
  constructor(private readonly configService: ConfigService) {
    // Define the client and store
    this.redisClient = new Redis({
      host: configService.get('redis.host'),
      port: configService.get('redis.port'),
      password: configService.get('redis.password'),
      db: configService.get('redis.convertion_store_db_index'),
    });
    this.redisStore = new RedisByteStore({
      client: this.redisClient,
    });
    // Define our encoder/decoder for converting between strings and Uint8Arrays
    this.encoder = new TextEncoder();
    this.decoder = new TextDecoder();
  }

  // 存储会话消息
  async storeConversation({
    convertionId,
    messages,
  }: {
    convertionId: string;
    messages: (HumanMessage | AIMessage)[];
  }) {
    // Set your messages in the store
    // The key will be prefixed with `convertion:id:` and end
    // with the index.
    await this.redisStore.mset(
      messages.map((message, index) => [
        `convertion:${convertionId}:${index}`,
        this.encoder.encode(JSON.stringify(message)),
      ]),
    );
  }

  // 获取会话消息
  async getConversation(convertionId: string) {
    const yieldedKeys = [];
    for await (const key of this.redisStore.yieldKeys(
      `convertion:${convertionId}:`,
    )) {
      yieldedKeys.push(key);
    }
    if (yieldedKeys.length === 0) {
      return [];
    }
    yieldedKeys.sort((a, b) => a.localeCompare(b));
    const retrievedMessages = await this.redisStore.mget(yieldedKeys);
    return retrievedMessages.map((v) => this.decoder.decode(v));
  }

  // 删除会话消息
  async deleteConversation(conversationId: string) {
    // Delete the keys
    const yieldedKeys = [];
    for await (const key of this.redisStore.yieldKeys(
      `convertion:${conversationId}:`,
    )) {
      yieldedKeys.push(key);
    }
    await this.redisStore.mdelete(yieldedKeys);
  }
}
