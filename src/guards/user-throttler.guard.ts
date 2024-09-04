import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class UserThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const user = req.user;
    return user ? user.id.toString() : super.getTracker(req);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const res = context.switchToHttp().getResponse();


    if (typeof res.header !== 'function') {
      res.header = (name: string, value: string) => {
        if (!res.headers) {
          res.headers = {};
        }
        res.headers[name] = value;
      };
    }

    return super.canActivate(context);
  }
}