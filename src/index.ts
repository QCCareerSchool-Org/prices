import * as HttpStatus from '@qccareerschool/http-status';
import compression from 'compression';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';

import { logger } from './logger';
import { router } from './router';

const app = express();
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

app.use(cors({ origin }));
app.use(helmet({ hsts: false, frameguard: false })); // NGINX will do these
app.use(compression());

app.use((req, res, next) => {
  let version = 1;
  if (req.headers['x-api-version']) {
    if (typeof req.headers['x-api-version'] === 'string') {
      version = parseInt(req.headers['x-api-version'], 10);
    } else if (req.headers['x-api-version'].length > 0) {
      version = parseInt(req.headers['x-api-version'][0], 10);
    }
  }
  res.locals.apiVersion = version;
  next();
});

app.use('/prices', router);

// global error middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof HttpStatus.HttpResponse && err.isClientError()) {
    res.status(err.statusCode).send({ message: err.message });
    return;
  }
  logger.error(err);
  res.status(500).send(err.message);
});

app.listen(HTTP_PORT);
