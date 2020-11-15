"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
var winston_nodemailer_1 = require("@qccareerschool/winston-nodemailer");
var dotenv_1 = __importDefault(require("dotenv"));
var winston_1 = __importStar(require("winston"));
dotenv_1.default.config();
if (typeof process.env.LOG_EMAIL_USERNAME === 'undefined') {
    throw new Error('LOG_EMAIL_USERNAME not specified in .env file');
}
var user = process.env.LOG_EMAIL_USERNAME;
if (typeof process.env.LOG_EMAIL_PASSWORD === 'undefined') {
    throw new Error('LOG_EMAIL_PASSWORD not specified in .env file');
}
var pass = process.env.LOG_EMAIL_PASSWORD;
if (typeof process.env.LOG_EMAIL_HOST === 'undefined') {
    throw new Error('LOG_EMAIL_HOST not specified in .env file');
}
var host = process.env.LOG_EMAIL_HOST;
if (typeof process.env.LOG_EMAIL_TLS === 'undefined') {
    throw new Error('LOG_EMAIL_TLS not specified in .env file');
}
var tls = process.env.LOG_EMAIL_TLS === 'true' ? true : false;
if (typeof process.env.LOG_EMAIL_PORT === 'undefined') {
    throw new Error('LOG_EMAIL_PORT not specified in .env file');
}
var port = parseInt(process.env.LOG_EMAIL_PORT, 10);
if (typeof process.env.LOG_EMAIL_TO === 'undefined') {
    throw new Error('LOG_EMAIL_TO not specified in .env file');
}
var to = process.env.LOG_EMAIL_TO;
if (typeof process.env.LOG_EMAIL_FROM === 'undefined') {
    throw new Error('LOG_EMAIL_FROM not specified in .env file');
}
var from = process.env.LOG_EMAIL_FROM;
/**
 * If the data passed to the logger is an instance of Error, transform the stack trace into an array
 * @param key
 * @param value
 */
var replacer = function (key, value) {
    if (value instanceof Error) {
        return Object.getOwnPropertyNames(value).reduce(function (previousValue, currentValue) {
            var _a;
            if (currentValue === 'stack') {
                return __assign(__assign({}, previousValue), { stack: value.stack.split('\n').map(function (v) {
                        v = v.trim();
                        return v.substr(0, 3) === 'at ' ? v.slice(3) : v;
                    }) });
            }
            else {
                return __assign(__assign({}, previousValue), (_a = {}, _a[currentValue] = value[currentValue], _a));
            }
        }, {});
    }
    else {
        return value;
    }
};
exports.logger = winston_1.default.createLogger({
    format: winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.json({ space: 2, replacer: replacer })),
    transports: [
        new winston_1.transports.Console({
            format: winston_1.format.colorize(),
        }),
        new winston_1.transports.File({
            filename: '/var/log/node-prices.log',
        }),
        new winston_nodemailer_1.NodemailerTransport({
            auth: { user: user, pass: pass },
            filter: function (_a) {
                var level = _a.level;
                return ['error', 'crit', 'alert', 'emerg'].includes(level);
            },
            from: from,
            host: host,
            port: port,
            secure: tls,
            tags: ['prices'],
            to: to,
        }),
    ],
});
