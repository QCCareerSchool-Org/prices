"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.versionMiddleware = void 0;
exports.versionMiddleware = function (req, res, next) {
    var version = 1;
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
};
