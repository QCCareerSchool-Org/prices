"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var compression_1 = __importDefault(require("compression"));
var cors_1 = __importDefault(require("cors"));
var express_1 = __importDefault(require("express"));
var helmet_1 = __importDefault(require("helmet"));
var logger_1 = require("./logger");
var router_1 = require("./router");
var httpErrorHandler_1 = require("./handlers/httpErrorHandler");
var errorHandler_1 = require("./handlers/errorHandler");
var versionMiddleware_1 = require("./handlers/versionMiddleware");
var HTTP_PORT = 15004;
var origin = [
    /(?:.*\.)?localhost(?::\d{1,5})?$/,
    /\.qcmakeupacademy\.com$/,
    /\.qceventplanning\.com$/,
    /\.qcdesignschool\.com$/,
    /\.qccareerschool\.com$/,
    /\.doggroomingcourse\.com$/,
    /\.qcwellnessstudies\.com$/,
    /\.winghill\.com$/,
    'https://blissful-hopper-b5c7db.netlify.com',
    /www-qcwellnessstudies-com\.now\.sh$/,
    /\.qccareerschool\.now\.sh$/,
];
var app = express_1.default();
app.use(cors_1.default({ origin: origin }));
app.use(helmet_1.default());
app.use(compression_1.default());
app.use(versionMiddleware_1.versionMiddleware);
app.use('/prices', router_1.router);
app.use(httpErrorHandler_1.httpErrorHandler);
app.use(errorHandler_1.errorHandler);
app.listen(HTTP_PORT, function () {
    logger_1.logger.info("Server running on port " + HTTP_PORT);
});
