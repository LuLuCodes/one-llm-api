/*
 * @Author: leyi leyi@myun.info
 * @Date: 2023-03-10 17:55:55
 * @LastEditors: leyi leyi@myun.info
 * @LastEditTime: 2023-07-19 11:15:34
 * @FilePath: /easy-front-nest-service/src/filter/any-exception.filter.ts
 * @Description:
 *
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved.
 */
/**
 * 捕获所有异常
 */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import { LoggerFactory } from '@libs/log4js';
import { ErrorResponse } from '@libs/util';
import { ResponseCode } from '@config/global';

const logger = LoggerFactory.getInstance();
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception.message;

    const logFormat = ` <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    Request original url: ${request.originalUrl}
    Method: ${request.method}
    IP: ${request.ip}
    Status code: ${status}
    Response: ${exception.toString()} \n  <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    `;
    logger.error(logFormat);

    const errorResponse = ErrorResponse(ResponseCode.SYS_ERROR, message);
    response.status(200);
    response.header('Content-Type', 'application/json; charset=utf-8');
    response.send({
      ...errorResponse,
      request_id: request.body.request_id || request.query.request_id,
    });
  }
}
