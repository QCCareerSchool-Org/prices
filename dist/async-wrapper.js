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
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncWrapper = void 0;
const HttpStatus = __importStar(require("@qccareerschool/http-status"));
const logger_1 = require("./logger");
exports.asyncWrapper = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
        if (err instanceof HttpStatus.HttpResponse) {
            if (err.isServerError()) {
                logger_1.logger.error(err);
            }
            return res.status(err.statusCode).send(err.message);
        }
        next(err);
    });
};
