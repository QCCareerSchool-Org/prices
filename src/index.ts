import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { logger } from './logger';
import { router } from './router';
import { httpErrorHandler } from './handlers/httpErrorHandler';
import { errorHandler } from './handlers/errorHandler';
import { versionMiddleware } from './handlers/versionMiddleware';

const HTTP_PORT = 15004;

const origin = [
  'http://192.168.6.197:3000',
  /(.*\.)?localhost:3000$/,
  'http://localhost:4200',
  'http://localhost:5000',
  'http://localhost:8000',
  /\.qcmakeupacademy\.com$/,
  /\.qceventplanning\.com$/,
  /\.qcdesignschool\.com$/,
  /\.qccareerschool\.com$/,
  /\.doggroomingcourse\.com$/,
  /\.qcwellnessstudies\.com$/,
  /\.winghill\.com$/,
  /\.qcstyleacademy\.com$/,
  /\.qctravelschool\.com$/,
  'https://blissful-hopper-b5c7db.netlify.com',
  /www-qcwellnessstudies-com\.now\.sh$/,
  /\.qccareerschool\.now\.sh$/,
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
