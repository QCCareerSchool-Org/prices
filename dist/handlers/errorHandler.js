"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
var logger_1 = require("../logger");
exports.errorHandler = function (err, req, res, next) {
    logger_1.logger.error(err);
    res.status(500).send(err.message);
};
