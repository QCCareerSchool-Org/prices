import type { RequestHandler } from 'express';
import { isbot } from 'isbot';

export const botHandler: RequestHandler = (req, res, next) => {
  res.setHeader('X-Robots-Tag', 'noindex');
  if (isbot(req.headers['user-agent'])) {
    res.status(403).end();
    return;
  }
  next();
};
