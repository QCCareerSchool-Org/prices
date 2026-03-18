import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { errorHandler } from './handlers/errorHandler';
import { httpErrorHandler } from './handlers/httpErrorHandler';
import { versionMiddleware } from './handlers/versionMiddleware';
import { logger } from './logger';
import { router } from './router';

const HTTP_PORT = 15004;

const origin = [
  /(?:.*\.)?localhost(?::\d{1,5})?$/iu,
  /\.qcmakeupacademy\.com$/iu,
  /\.qceventplanning\.com$/iu,
  /\.qcdesignschool\.com$/iu,
  /\.qccareerschool\.com$/iu,
  /\.doggroomingcourse\.com$/iu,
  /\.qcwellnessstudies\.com$/iu,
  /\.qcpetstudies\.com$/iu,
  /\.winghill\.com$/iu,
  /\.pawparentacademy\.com$/iu,
  'https://blissful-hopper-b5c7db.netlify.com',
  /www-qcwellnessstudies-com\.now\.sh$/iu,
  /\.qccareerschool\.now\.sh$/iu,
  /-qccareerschool\.vercel\.app$/iu,
];

const app = express();
app.use(cors({ origin }));
app.use(helmet());
app.use(compression());
app.use(versionMiddleware);
app.use('/prices', router);
app.use(httpErrorHandler);
app.use(errorHandler);

app.listen(HTTP_PORT, () => {
  logger.info(`Server running on port ${HTTP_PORT}`);
});
