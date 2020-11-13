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
const HttpStatus = __importStar(require("@qccareerschool/http-status"));
const compression_1 = __importDefault(require("compression"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const logger_1 = require("./logger");
const router_1 = require("./router");
const app = express_1.default();
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
app.use(cors_1.default({ origin }));
app.use(helmet_1.default({ hsts: false, frameguard: false })); // NGINX will do these
app.use(compression_1.default());
app.use((req, res, next) => {
    let version = 1;
    if (req.headers['x-api-version']) {
        if (typeof req.headers['x-api-version'] === 'string') {
            version = parseInt(req.headers['x-api-version'], 10);
        }
        else if (req.headers['x-api-version'].length > 0) {
            version = parseInt(req.headers['x-api-version'][0], 10);
        }
    }
    res.locals.apiVersion = version;
    next();
});
app.use('/prices', router_1.router);
// global error middleware
app.use((err, req, res, next) => {
    if (err instanceof HttpStatus.HttpResponse && err.isClientError()) {
        res.status(err.statusCode).send({ message: err.message });
        return;
    }
    logger_1.logger.error(err);
    res.status(500).send(err.message);
});
app.listen(HTTP_PORT);
