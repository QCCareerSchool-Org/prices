"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncWrapper = void 0;
exports.asyncWrapper = function (fn) { return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(function (err) { return next(err); });
}; };
