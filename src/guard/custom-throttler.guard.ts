/*
 * @Author: leyi leyi@myun.info
 * @Date: 2024-08-07 16:19:23
 * @LastEditors: leyi leyi@myun.info
 * @LastEditTime: 2024-08-07 18:09:31
 * @FilePath: /one-llm-api/src/guard/custom-throttler.guard.ts
 * @Description:
 *
 * Copyright (c) 2024 by ${git_name_email}, All Rights Reserved.
 */
import { Injectable } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';
import { ThrottlerRequest } from '@nestjs/throttler/dist/throttler.guard.interface';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, any>): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const tracker = req.headers['x-forwarded-for'] || req.ip;
      resolve(tracker);
    });
  }

  protected errorMessage = 'Rate limit exceeded';

  async handleRequest(requestProps: ThrottlerRequest): Promise<boolean> {
    const { context, limit, ttl, throttler, blockDuration } = requestProps;
    const request = this.getRequestResponse(context).req;

    const ip = request.headers['x-forwarded-for'] || request.ip;
    const key = this.generateKey(context, ip, throttler.name);

    const { totalHits, timeToExpire } = await this.storageService.increment(
      key,
      ttl,
      limit,
      blockDuration,
      throttler.name,
    );
    console.log('totalHits:', totalHits);
    console.log('timeToExpire:', timeToExpire);
    const response = this.getRequestResponse(context).res;
    if (totalHits > limit) {
      response.header('X-RateLimit-Limit', limit);
      response.header('X-RateLimit-Remaining', 0);
      response.header('X-RateLimit-Reset', Math.ceil(timeToExpire / 1000));
      throw new ThrottlerException(this.errorMessage);
    }

    response.header('X-RateLimit-Limit', limit);
    response.header('X-RateLimit-Remaining', Math.max(0, limit - totalHits));
    response.header('X-RateLimit-Reset', Math.ceil(timeToExpire / 1000));
    return true;
  }
}
