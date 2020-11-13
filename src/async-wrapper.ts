import * as HttpStatus from '@qccareerschool/http-status';
import { NextFunction, Request, Response } from 'express';

import { logger } from './logger';

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;

export const asyncWrapper = (fn: AsyncRequestHandler) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    if (err instanceof HttpStatus.HttpResponse) {
      if (err.isServerError()) {
        logger.error(err);
      }
      return res.status(err.statusCode).send(err.message);
    }
    next(err);
  });
};
