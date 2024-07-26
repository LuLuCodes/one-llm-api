/*
 * @Author: leyi leyi@myun.info
 * @Date: 2024-07-25 18:54:44
 * @LastEditors: leyi leyi@myun.info
 * @LastEditTime: 2024-07-25 18:55:10
 * @FilePath: /one-llm-api/src/config/llm.ts
 * @Description:
 *
 * Copyright (c) 2024 by ${git_name_email}, All Rights Reserved.
 */
import { envNumber, env } from '@libs/env-unit';
import { registerAs } from '@nestjs/config';

export default registerAs('llm', () => ({
  zhipu_api_key: env('ZHIPU_API_KEY', ''),
  moonshot_api_key: env('MOONSHOT_API_KEY', ''),
}));
