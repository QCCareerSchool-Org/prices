"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_nodemailer_1 = require("@qccareerschool/winston-nodemailer");
const winston_1 = __importStar(require("winston"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
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
const replacer = (key, value) => {
    if (value instanceof Error) {
        return Object.getOwnPropertyNames(value).reduce((previousValue, currentValue) => {
            if (currentValue === 'stack') {
                return Object.assign(Object.assign({}, previousValue), { stack: value.stack.split('\n').map((v) => {
                        v = v.trim();
                        return v.substr(0, 3) === 'at ' ? v.slice(3) : v;
                    }) });
            }
            else {
                return Object.assign(Object.assign({}, previousValue), { [currentValue]: value[currentValue] });
            }
        }, {});
    }
    else {
        return value;
    }
};
exports.logger = winston_1.default.createLogger({
    level: 'info',
    format: winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.json({ space: 2, replacer })),
    transports: [
        new winston_1.default.transports.File({ filename: 'error.log', level: 'error' }),
        new winston_1.default.transports.File({ filename: 'combined.log' }),
        new winston_nodemailer_1.NodemailerTransport({
            auth: {
                pass: password,
                user: username,
            },
            filter: ({ level }) => level === 'error' || level === 'crit' || level === 'alert' || level === 'emerg',
            from,
            host,
            port: 587,
            secure: false,
            tags: ['prices'],
            to,
        }),
    ],
});
