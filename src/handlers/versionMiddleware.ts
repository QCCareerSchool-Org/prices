import type { NextFunction, Request, Response } from 'express';

export const versionMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  let version = 1;
  if (req.headers['x-api-version']) {
    if (typeof req.headers['x-api-version'] === 'string') {
      version = parseInt(req.headers['x-api-version'], 10);
    } else if (req.headers['x-api-version'].length > 0) {
      const firstHeader = req.headers['x-api-version'][0];
      if (typeof firstHeader !== 'undefined') {
        version = parseInt(firstHeader, 10);
      }
    }
  }
  res.locals.apiVersion = version;
  next();
};
