/*
 * @Author: leyi leyi@myun.info
 * @Date: 2024-06-25 20:52:38
 * @LastEditors: leyi leyi@myun.info
 * @LastEditTime: 2024-07-25 15:31:19
 * @FilePath: /one-llm-api/src/config/redis.ts
 * @Description:
 *
 * Copyright (c) 2024 by ${git_name_email}, All Rights Reserved.
 */
import { envNumber, env } from '@libs/env-unit';
import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  host: env('REDIS_HOST', '127.0.0.1'),
  port: envNumber('REDIS_PORT', 6379),
  password: env('REDIS_PASSWORD', ''),
  convertion_store_db_index: envNumber('CONVERTION_STORE_DB_INDEX', 0),
}));
