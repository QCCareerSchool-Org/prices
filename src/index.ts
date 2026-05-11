import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { botHandler } from './handlers/botHandler';
import { errorHandler } from './handlers/errorHandler';
import { httpErrorHandler } from './handlers/httpErrorHandler';
import { versionMiddleware } from './handlers/versionMiddleware';
import { router } from './router';

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
  /-qccareerschool\.vercel\.app$/iu,
];

const app = express();
app.set('query parser', 'extended');
app.use(cors({ origin }));
app.use(helmet());
app.use(compression());
app.use(versionMiddleware);
app.use(botHandler);
app.use('/prices', router);
app.use(httpErrorHandler);
app.use(errorHandler);

if (process.env.NODE_ENV !== 'production') {
  app.listen(8080);
}

export default app;
