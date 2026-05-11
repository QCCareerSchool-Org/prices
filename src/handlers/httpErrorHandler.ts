import type { NextFunction, Request, Response } from 'express';

import * as HttpStatus from '../lib/http-status';

export const httpErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  if (!res.headersSent) {
    if (err instanceof HttpStatus.HttpResponse) {
      // only log server errors, not client errors
      if (err.isServerError()) {
        console.error(err);
      }
      res.status(err.statusCode).send(err.message);
      return;
    }
  }
  next(err);
};
