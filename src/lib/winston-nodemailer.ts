import * as util from 'util';
import * as nodemailer from 'nodemailer';
import type { Address } from 'nodemailer/lib/mailer';
import Transport from 'winston-transport';

export interface INodemailerOptions extends Transport.TransportStreamOptions {
  auth: {
    pass: string;
    user: string;
  };
  from: string | Address;
  host: string;
  port: number;
  secure: boolean;
  tags?: string[];
  to: string | Address | (string | Address)[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filter?: (info: any) => boolean;
}

export class NodemailerTransport extends Transport {

  private readonly from?: string | Address;
  private readonly to?: string | Address | (string | Address)[];

  private readonly tags?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly filter?: (info: any) => boolean;

  private readonly smtpTransport?: nodemailer.Transporter;

  public constructor(opts: INodemailerOptions) {
    super(opts);

    this.to = opts.to;
    this.from = opts.from;

    if (!(this.to && this.from)) {
      throw new Error('Winston-nodemailer Specify to and from');
    }

    if (opts.filter) {
      this.filter = opts.filter;
    }

    if (opts.tags) {
      this.tags = opts.tags.map(tag => {
        return '[' + tag + '] ';
      }).join('');
    }

    try {
      this.smtpTransport = nodemailer.createTransport(opts);
    } catch (err) {
      console.error('Unable to initialize nodemailer--logs won\'t be emailed.', err);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public log(info: any, next: () => void): any {
    if (this.silent) {
      return next();
    }

    if (this.filter && !this.filter(info)) {
      return next();
    }

    let text = 'undefined';
    if (hasMessage(info)) {
      if (typeof info.message === 'string') {
        text = info.message;
      } else {
        text = util.inspect(info.message);
      }
    }

    const subject = (this.tags ?? '') + (hasLevel(info) && typeof info.level === 'string' ? `[${info.level}] ` : '') + text.slice(0, 51);

    const meta: Record<string, unknown> = {};
    let hasMeta = false;
    if (isObject(info)) {
      for (const key of Object.keys(info)) {
        if (key !== 'message' && key !== 'level') {
          meta[key] = info[key as keyof typeof info];
          hasMeta = true;
        }
      }
    }

    if (hasMeta) {
      text += '\n---\n' + util.inspect(meta);
    }

    this.smtpTransport?.sendMail({
      from: this.from,
      subject,
      text,
      to: this.to,
    }, next);
  }
}

const isObject = (info: unknown): info is object => {
  return typeof info === 'object' && info !== null;
};

const hasMessage = (info: unknown): info is { message: unknown } => {
  return typeof info === 'object' && info !== null && 'message' in info;
};

const hasLevel = (info: unknown): info is { level: unknown } => {
  return typeof info === 'object' && info !== null && 'level' in info;
};
