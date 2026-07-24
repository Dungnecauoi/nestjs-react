import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RedirectRootMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const apiPrefix = process.env.API_PREFIX || 'api';
    if (req.url === '/' || req.url === '') {
      return res.redirect(`/${apiPrefix}`);
    }
    next();
  }
}
