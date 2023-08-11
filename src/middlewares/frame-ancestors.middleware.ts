import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class FrameAncestorsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // List the domains you want to allow to embed your content
    const allowedDomains = 'https://example.com https://another-example.com';
    const cspHeader = `frame-ancestors ${allowedDomains};`;
    console.log('=>(frame-ancestors.middleware.ts:10) cspHeader', cspHeader);

    // Set the Content-Security-Policy header
    res.setHeader('Content-Security-Policy', cspHeader);

    next();
  }
}
