/*
 * @Author: leyi leyi@myun.info
 * @Date: 2024-07-26 13:59:06
 * @LastEditors: leyi leyi@myun.info
 * @LastEditTime: 2024-07-26 14:09:23
 * @FilePath: /one-llm-api/src/modules/llm/llm.dto.ts
 * @Description:
 *
 * Copyright (c) 2024 by ${git_name_email}, All Rights Reserved.
 */
import {
  IsInt,
  IsArray,
  IsOptional,
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsIn,
  IsBoolean,
  IsNumber,
  Min,
} from 'class-validator';

export class ChatDTO {
  @IsString({ message: 'input必须是字符串' })
  @IsNotEmpty({ message: 'input是必填项' })
  readonly input: string;

  // modelType必须是'zhipu'、'kimi'
  @IsString({ message: 'modelType必须是字符串' })
  @IsNotEmpty({ message: 'modelType是必填项' })
  @IsIn(['zhipu', 'kimi'], { message: 'modelType必须是zhipu或kimi' })
  readonly modelType: string;

  @IsString({ message: 'modelName必须是字符串' })
  @IsNotEmpty({ message: 'modelName是必填项' })
  readonly modelName: string;

  @IsOptional()
  @IsNumber(
    {
      allowNaN: false,
      allowInfinity: false,
      maxDecimalPlaces: 2,
    },
    { message: 'temperature必须是数字' },
  )
  @Min(0.1, { message: 'temperature必须大于等于0.1' })
  readonly temperature?: number;

  @IsOptional()
  @IsNumber(
    {
      allowNaN: false,
      allowInfinity: false,
      maxDecimalPlaces: 2,
    },
    { message: 'topP必须是数字' },
  )
  @Min(0.1, { message: 'topP必须大于等于0.1' })
  readonly topP?: number;

  @IsOptional()
  @IsNumber(
    {
      allowNaN: false,
      allowInfinity: false,
    },
    { message: 'maxTokens必须是数字' },
  )
  @Min(1024, { message: 'topP必须大于等于1024' })
  readonly maxTokens?: number;
}
