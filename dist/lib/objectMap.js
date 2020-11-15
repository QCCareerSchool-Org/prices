"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.objectMap = void 0;
exports.objectMap = function (obj, mapFunction) {
    if (!obj)
        return {};
    return Object.keys(obj).reduce(function (result, key) {
        result[key] = mapFunction(obj[key]);
        return result;
    }, {});
};
