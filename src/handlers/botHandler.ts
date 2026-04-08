import type { RequestHandler } from 'express';
import { isbot } from 'isbot';

import { logger } from '../logger';

export const botHandler: RequestHandler = (req, res, next) => {
  res.setHeader('X-Robots-Tag', 'noindex');

  const userAgent = req.headers['user-agent'];

  if (isbot(userAgent)) {
    logger.info('Blocked bot request', { userAgent, path: req.path, method: req.method });

    res.sendStatus(403);
    return;
  }
  next();
};
