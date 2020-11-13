"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const promise_mysql_1 = __importDefault(require("promise-mysql"));
dotenv_1.default.config();
const DEFAULT_CONNECTION_LIMIT = 100;
const options = {
    charset: process.env.DB_CHARSET,
    connectionLimit: typeof process.env.DB_CONNECTION_LIMIT === 'undefined' ? DEFAULT_CONNECTION_LIMIT : parseInt(process.env.DB_CONNECTION_LIMIT, 10),
    database: process.env.DB_DATABASE,
    debug: process.env.DB_DEBUG === 'TRUE' ? true : false,
    password: process.env.DB_PASSWORD,
    user: process.env.DB_USERNAME,
};
if (typeof process.env.DB_SOCKET_PATH !== 'undefined') {
    options.socketPath = process.env.DB_SOCKET_PATH;
}
else if (typeof process.env.DB_HOST !== 'undefined') {
    options.host = process.env.DB_HOST;
}
if (typeof process.env.DB_SSL !== 'undefined' && process.env.DB_SSL === 'TRUE') {
    options.ssl = {};
    if (typeof process.env.DB_SSL_CERT !== 'undefined') {
        options.ssl.cert = fs_1.default.readFileSync(process.env.DB_SSL_CERT);
    }
    if (typeof process.env.DB_SSL_KEY !== 'undefined') {
        options.ssl.key = fs_1.default.readFileSync(process.env.DB_SSL_KEY);
    }
    if (typeof process.env.DB_SSL_CA !== 'undefined') {
        options.ssl.ca = fs_1.default.readFileSync(process.env.DB_SSL_CA);
    }
}
exports.pool = promise_mysql_1.default.createPool(options);
