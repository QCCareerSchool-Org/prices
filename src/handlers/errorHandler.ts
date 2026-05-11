import type { NextFunction, Request, Response } from 'express';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error(err);
  if (!res.headersSent) {
    res.status(500).send(err.message);
  } else {
    next(err);
  }
};
