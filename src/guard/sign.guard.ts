/*
 * @Author: leyi leyi@myun.info
 * @Date: 2021-12-25 14:14:15
 * @LastEditors: leyi leyi@myun.info
 * @LastEditTime: 2024-01-24 17:11:23
 * @FilePath: /easy-front-nest-service/src/guard/sign.guard.ts
 * @Description:
 *
 * Copyright (c) 2024 by ${git_name_email}, All Rights Reserved.
 */
import {
  Injectable,
  CanActivate,
  HttpException,
  HttpStatus,
  ExecutionContext,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { checkSign } from '@libs/cryptogram';
import { Kit } from '@easy-front-core-sdk/kits';

@Injectable()
export class SignGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { headers, path: url, method } = request;
    let request_data = null;
    if (method === 'GET') {
      request_data = request.query;
    } else {
      request_data = request.body;
    }
    if (
      headers['x-from-swagger'] === 'swagger' ||
      this.hasUrl(this.configService.get('while_list.sign'), url)
    ) {
      delete request_data.sign;
      delete request_data.timestamp;
      return true;
    }
    const { sign, timestamp } = request_data;
    // 如果白名单里面有的url就不拦截

    if (!sign) {
      throw new HttpException('缺少签名参数', HttpStatus.FORBIDDEN);
    }
    if (!timestamp) {
      throw new HttpException('缺少时间戳参数', HttpStatus.FORBIDDEN);
    }

    const nowTime = new Date().getTime();
    if (Math.abs(parseInt(timestamp) - nowTime) > 600000) {
      throw new HttpException('拒绝请求重放', HttpStatus.FORBIDDEN);
    }
    try {
      delete request_data.sign;
      let isOk = false;
      if (method === 'GET') {
        isOk = checkSign(sign, Kit.makeSortStr(request_data), url);
      } else {
        isOk = checkSign(sign, JSON.stringify(request_data), url);
      }

      delete request_data.timestamp;
      if (isOk) {
        return true;
      }
      throw new HttpException('签名错误', HttpStatus.FORBIDDEN);
    } catch (e) {
      console.log('to sign', e.message);
      throw new HttpException('签名校验异常', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * @param {string[]} urlList url列表
   * @param {url} url 当前要判断的url列表
   * @return:
   * @Description: 判断一个url列表中是否包含一个url
   * @Author: qian.qing@aliyun.com
   * @LastEditors: qian.qing@aliyun.com
   * @Date: 2020-08-15 14:28:11
   */
  private hasUrl(urlList: string[], url: string): boolean {
    let flag = false;
    for (const item of urlList) {
      if (Object.is(item.replace(/\//gi, ''), url.replace(/\//gi, ''))) {
        flag = true;
      }
    }
    return flag;
  }
}
