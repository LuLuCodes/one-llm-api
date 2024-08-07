import { Injectable } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';
import { ThrottlerRequest } from '@nestjs/throttler/dist/throttler.guard.interface';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, any>): Promise<string> {
    return req.headers['x-forwarded-for'] || req.ip;
  }

  protected errorMessage = 'Rate limit exceeded';

  async handleRequest(requestProps: ThrottlerRequest): Promise<boolean> {
    const { context, limit, ttl } = requestProps;
    const request = this.getRequestResponse(context).req;

    // 调用基类的 handleRequest 方法
    try {
      await super.handleRequest({ context, limit, ttl } as ThrottlerRequest);
    } catch (error) {
      if (error instanceof ThrottlerException) {
        // 在这里处理限流异常，例如添加自定义头部
        const response = context.switchToHttp().getResponse();
        response.header('X-RateLimit-Limit', limit);
        response.header('X-RateLimit-Remaining', 0);
        response.header(
          'X-RateLimit-Reset',
          this.getResetTime(request.throttler),
        );
        throw error; // 重新抛出异常，让 NestJS 异常过滤器处理
      }
      throw error;
    }

    // 如果没有抛出异常，说明请求未被限流
    const response = context.switchToHttp().getResponse();
    response.header('X-RateLimit-Limit', limit);
    response.header(
      'X-RateLimit-Remaining',
      this.getRequestsLeft(request.throttler),
    );
    response.header('X-RateLimit-Reset', this.getResetTime(request.throttler));

    return true;
  }

  private getRequestsLeft(tracker: any): number {
    return tracker.limit - tracker.current;
  }

  private getResetTime(tracker: any): number {
    return Math.ceil((tracker.expiresAt - Date.now()) / 1000);
  }
}
