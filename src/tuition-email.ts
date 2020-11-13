import nodeMailer from 'nodemailer';

import { PriceResult, PriceQuery } from './prices';

export type TuitionEmailBody = PriceQuery & {
  emailAddress: string;
  school: 'makeup' | 'event' | 'design' | 'pet' | 'wellness';
}

export async function sendTuitionEmail(emailAddress: string, school: string, price: PriceResult) {
  const transport = nodeMailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT ? parseInt(process.env.MAIL_PORT, 10) : undefined,
    secure: process.env.MAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
  const info = await transport.sendMail({
    from: '"Fred Foo 👻" <foo@example.com>',
    to: 'dave@qccareerschool.com',
    subject: 'Hello ✔',
    text: 'Hello world?',
    html: '<b>Hello world?</b>',
  });
}
