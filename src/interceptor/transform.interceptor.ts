/*
 * @Author: leyi leyi@myun.info
 * @Date: 2021-11-25 17:08:33
 * @LastEditors: leyi leyi@myun.info
 * @LastEditTime: 2023-07-24 16:44:15
 * @FilePath: /douyin-shop-master-service/src/interceptor/transform.interceptor.ts
 * @Description:
 *
 * Copyright (c) 2022 by leyi leyi@myun.info, All Rights Reserved.
 */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  HttpStatus,
} from '@nestjs/common';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { OkResponse } from '@libs/util';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest();
    const res = ctx.getResponse();
    const request_id = uuidv4().replace(/-/g, '');
    req.body.request_id = request_id;
    req.query.request_id = request_id;
    const responseFun = Reflect.getMetadata('OkResponse', context.getHandler());
    return next.handle().pipe(
      map((data) => {
        if (req.body && req.body.ef_author) {
          data.ef_author = 'qian.qing@aliyun.com';
        }
        res.status(HttpStatus.OK);
        if (responseFun) {
          return { ...responseFun(data), request_id: request_id };
        } else {
          return { ...OkResponse(data), request_id: request_id };
        }
      }),
    );
  }
}
