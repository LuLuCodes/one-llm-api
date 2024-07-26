/*
 * @Author: leyi leyi@myun.info
 * @Date: 2024-07-26 13:54:37
 * @LastEditors: leyi leyi@myun.info
 * @LastEditTime: 2024-07-26 14:49:18
 * @FilePath: /one-llm-api/src/modules/llm/llm.controller.ts
 * @Description:
 *
 * Copyright (c) 2024 by ${git_name_email}, All Rights Reserved.
 */
import {
  Controller,
  Post,
  Body,
  UsePipes,
  Session,
  Param,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ValidationPipe } from '@pipe/validation.pipe';
import { LlmService } from './llm.service';

import { ChatDTO } from './llm.dto';

@Controller('llm')
export class LlmController {
  constructor(private readonly llmService: LlmService) {}

  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('chat/:convertionId?')
  async loginByAccount(
    @Param('convertionId') convertionId: string,
    @Body() body: ChatDTO,
    @Session() session,
  ): Promise<any> {
    return await this.llmService.processBlockResponse({
      convertionId,
      systemPrompt: body.systemPrompt,
      imageBase64: body.imageBase64,
      userInput: body.userInput,
      modelType: body.modelType,
      modelName: body.modelName,
      temperature: body.temperature,
      topP: body.topP,
      maxTokens: body.maxTokens,
    });
  }

  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('chat-stream/:convertionId?')
  async streamResponse(
    @Param('convertionId') convertionId: string,
    @Body() body: ChatDTO,
    @Session() session,
    @Res() res: Response,
  ) {
    res.writeHead(HttpStatus.OK, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });

    const stream = this.llmService.processStreamResponse({
      convertionId,
      systemPrompt: body.systemPrompt,
      imageBase64: body.imageBase64,
      userInput: body.userInput,
      modelType: body.modelType,
      modelName: body.modelName,
      temperature: body.temperature,
      topP: body.topP,
      maxTokens: body.maxTokens,
    });

    stream.subscribe({
      next: (chunk: string) => {
        const data = JSON.parse(chunk);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      },
      complete: () => {
        res.write(`data: ${JSON.stringify({ content: '[DONE]' })}\n\n`);
        res.end();
      },
      error: (error) => {
        console.error('Error in stream:', error);
        res.write(
          `data: ${JSON.stringify({ error: 'An error occurred' })}\n\n`,
        );
        res.end();
      },
    });
  }
}
