import type { RequestHandler } from 'express';
import { isbot } from 'isbot';

import { logger } from '../logger';

export const botHandler: RequestHandler = (req, res, next) => {
  res.setHeader('X-Robots-Tag', 'noindex');

  if (req.method === 'OPTIONS') {
    next();
    return;
  }

  const userAgent = req.headers['user-agent'];
  if (!userAgent) {
    next();
    return;
  }

  if (knownCrawlers.some(regex => regex.test(userAgent))) {
    logger.info('Blocked crawler', { userAgent, path: req.path, query: req.query, method: req.method });

    res.sendStatus(403);
    return;
  }

  if (botExclusions.every(regex => !regex.test(userAgent)) && isbot(userAgent)) {
    const countryCode = typeof req.query.countryCode === 'string' ? req.query.countryCode.toUpperCase() : undefined;
    const provinceCode = typeof req.query.provinceCode === 'string' ? req.query.provinceCode.toUpperCase() : undefined;

    if ((countryCode === 'CA' || countryCode === 'US') && !provinceCode) {
      logger.info('Blocked bot', { userAgent, path: req.path, query: req.query, method: req.method });

      res.sendStatus(403);
      return;
    }

    logger.info('Detected bot', { userAgent, path: req.path, query: req.query, method: req.method });
  }

  next();
};

const botExclusions = [
  /^node$/iu,
  /^axios(?:\/[\d.]+)?$/iu,
  /^PostmanRuntime(?:\/[\d.]+)?$/iu,
];

const knownCrawlers: RegExp[] = [
  // Major search engines
  /googlebot/iu,
  /bingbot/iu,
  /slurp/iu, // Yahoo
  /duckduckbot/iu,
  /baiduspider/iu,
  /yandex(bot)?/iu,
  /AdsBot-Google/iu,
  /googleother/iu,

  // Apple / misc legit crawlers
  /applebot/iu,
  /facebookexternalhit/iu,
  /facebot/iu,
  /twitterbot/iu,
  /linkedinbot/iu,
  /embedly/iu,

  // SEO tools / common crawlers (optional depending on how aggressive you want to be)
  /ahrefs(bot)?/iu,
  /semrush(bot)?/iu,
  /mj12bot/iu,
  /dotbot/iu,
  /seznambot/iu,
  /sogou/iu,
  /exabot/iu,
  /petalbot/iu,
  /bytespider/iu, // TikTok / ByteDance
];
