/*
 * @Author: leyi leyi@myun.info
 * @Date: 2024-06-25 20:52:38
 * @LastEditors: leyi leyi@myun.info
 * @LastEditTime: 2024-08-07 17:40:30
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
  throttler_store_db_index: envNumber('THROTTLER_STORE_DB_INDEX', 14),
}));
