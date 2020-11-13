import { NodemailerTransport } from '@qccareerschool/winston-nodemailer';
import winston, { format } from 'winston';
import dotenv from 'dotenv';

dotenv.config();

if (typeof process.env.LOG_MAIL_USERNAME === 'undefined') {
  throw new Error('EMAIL_USERNAME not specified in .env file');
}
const username = process.env.LOG_MAIL_USERNAME;

if (typeof process.env.LOG_MAIL_PASSWORD === 'undefined') {
  throw new Error('EMAIL_PASSWORD not specified in .env file');
}
const password = process.env.LOG_MAIL_PASSWORD;

if (typeof process.env.LOG_MAIL_HOST === 'undefined') {
  throw new Error('EMAIL_HOST not specified in .env file');
}
const host = process.env.LOG_MAIL_HOST;

if (typeof process.env.LOG_MAIL_TLS === 'undefined') {
  throw new Error('EMAIL_TLS not specified in .env file');
}
const tls = process.env.LOG_MAIL_TLS === 'TRUE' ? true : false;

if (typeof process.env.LOG_MAIL_TO === 'undefined') {
  throw new Error('EMAIL_TO not specified in .env file');
}
const to = process.env.LOG_MAIL_TO;

if (typeof process.env.LOG_MAIL_FROM === 'undefined') {
  throw new Error('EMAIL_FROM not specified in .env file');
}
const from = process.env.LOG_MAIL_FROM;

/**
 * If the data passed to the logger is an instance of Error, transform the stack trace into an array
 * @param key
 * @param value
 */
const replacer = (key: string, value: any) => {
  if (value instanceof Error) {
    return Object.getOwnPropertyNames(value).reduce((previousValue, currentValue) => {
      if (currentValue === 'stack') {
        return {
          ...previousValue,
          stack: value.stack!.split('\n').map((v) => {
            v = v.trim();
            return v.substr(0, 3) === 'at ' ? v.slice(3) : v;
          }),
        };
      } else {
        return {
          ...previousValue,
          [currentValue]: value[currentValue as keyof Error],
        };
      }
    }, {});
  } else {
    return value;
  }
};

export const logger = winston.createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json({ space: 2, replacer }),
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new NodemailerTransport({
      auth: {
        pass: password,
        user: username,
      },
      filter: ({ level }: { level: string }) => level === 'error' || level === 'crit' || level === 'alert' || level === 'emerg',
      from,
      host,
      port: 587,
      secure: false,
      tags: [ 'prices' ],
      to,
    }),
  ],
});
