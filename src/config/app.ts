/*
 * @Author: leyi leyi@myun.info
 * @Date: 2024-06-25 20:52:38
 * @LastEditors: leyi leyi@myun.info
 * @LastEditTime: 2024-08-07 16:21:18
 * @FilePath: /one-llm-api/src/config/app.ts
 * @Description:
 *
 * Copyright (c) 2024 by ${git_name_email}, All Rights Reserved.
 */
import { envBoolean, envNumber, env } from '@libs/env-unit';
import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  node_env: env('NODE_ENV', 'development'),
  name: env('APP_NAME', 'one-llm-api'),
  desc: env('APP_DESC', '基于nestjs和langchain的LLM API Service'),
  version: env('APP_VERSION', '1.0.0'),
  port: envNumber('APP_PORT', 8000),
  upload_dir: env('UPLOAD_DIR', './uploads'),
  throttle_ttl: envNumber('THROTTLE_TTL', 60),
  throttle_limit: envNumber('THROTTLE_LIMIT', 60),
}));
