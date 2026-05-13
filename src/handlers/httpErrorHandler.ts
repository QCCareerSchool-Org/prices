import type { NextFunction, Request, Response } from 'express';

import { ClientError, ServerError } from '../lib/errors';

export const httpErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  if (!res.headersSent) {
    if (err instanceof ClientError || err instanceof ServerError) {
      if (err instanceof ServerError) {
        console.error(err);
      }
      res.status(err instanceof ClientError ? 400 : 500).send(err.message);
      return;
    }
  }
  next(err);
};
