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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
var HttpStatus = __importStar(require("@qccareerschool/http-status"));
var yup = __importStar(require("yup"));
var express_1 = __importDefault(require("express"));
var asyncWrapper_1 = require("./lib/asyncWrapper");
var prices_1 = require("./prices");
var pool_1 = require("./pool");
var oldPrices_1 = require("./oldPrices");
var objectMap_1 = require("./lib/objectMap");
var logger_1 = require("./logger");
// validate the parameters
var priceSchema = yup.object({
    courses: yup.array(yup.string().required()).default([]).required(),
    countryCode: yup.string().length(2).required(),
    provinceCode: yup.string().max(3),
    options: yup.object({
        noShipping: yup.boolean(),
        discountAll: yup.boolean(),
        discount: yup.object({
            default: yup.number().required(),
            CAD: yup.number(),
            USD: yup.number(),
            GBP: yup.number(),
            AUD: yup.number(),
            NZD: yup.number(),
        }).default(undefined),
        discountSignature: yup.string(),
        MMFreeMW: yup.boolean(),
        deluxeKit: yup.boolean(),
        portfolio: yup.boolean(),
        depositOverride: yup.lazy(function (obj) { return yup.object(objectMap_1.objectMap(obj, function () { return yup.number(); })); }),
        installmentsOverride: yup.number().min(1).max(24),
        studentDiscount: yup.boolean(),
        school: yup.string(),
    }),
});
var oldPriceSchema = yup.object({
    courses: yup.array(yup.string().required()).default([]).required(),
    countryCode: yup.string().length(2).required(),
    provinceCode: yup.string().max(3).nullable(true).default(null).required(),
    discountAll: yup.number(),
    options: yup.object({
        discountAll: yup.boolean(),
        discount: yup.number().min(0),
        discountSignature: yup.string(),
        MMFreeMW: yup.boolean(),
        deluxeKit: yup.boolean(),
        portfolio: yup.boolean(),
        campaignId: yup.string(),
        discountCode: yup.string(),
        discountGBP: yup.number().min(0),
        discountSignatureGBP: yup.string(),
    }),
    _: yup.number(),
});
exports.router = express_1.default.Router();
exports.router.get('/', asyncWrapper_1.asyncWrapper(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                res.setHeader('Cache-Control', 'public, max-age=300'); // five minutes
                _b = (_a = res).send;
                if (!(res.locals.apiVersion === 2)) return [3 /*break*/, 2];
                return [4 /*yield*/, newPrices(req)];
            case 1:
                _c = _d.sent();
                return [3 /*break*/, 4];
            case 2: return [4 /*yield*/, oldPrices(req)];
            case 3:
                _c = _d.sent();
                _d.label = 4;
            case 4:
                _b.apply(_a, [_c]);
                return [2 /*return*/];
        }
    });
}); }));
var newPrices = function (req) { return __awaiter(void 0, void 0, void 0, function () {
    var connection, query, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, pool_1.pool];
            case 1: return [4 /*yield*/, (_a.sent()).getConnection()];
            case 2:
                connection = _a.sent();
                _a.label = 3;
            case 3:
                _a.trys.push([3, , 8, 9]);
                query = void 0;
                _a.label = 4;
            case 4:
                _a.trys.push([4, 6, , 7]);
                return [4 /*yield*/, priceSchema.validate(req.query)];
            case 5:
                query = _a.sent();
                return [3 /*break*/, 7];
            case 6:
                err_1 = _a.sent();
                throw new HttpStatus.BadRequest(err_1.message);
            case 7:
                if (typeof query === 'undefined') {
                    throw new HttpStatus.InternalServerError('Could not cast querystring');
                }
                return [2 /*return*/, prices_1.getPrices(connection, query.courses, query.countryCode, query.provinceCode, query.options)];
            case 8:
                connection.release();
                return [7 /*endfinally*/];
            case 9: return [2 /*return*/];
        }
    });
}); };
var oldPrices = function (req) { return __awaiter(void 0, void 0, void 0, function () {
    var connection, query, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                logger_1.logger.warn('Old prices function called', req.headers.origin);
                return [4 /*yield*/, pool_1.pool];
            case 1: return [4 /*yield*/, (_a.sent()).getConnection()];
            case 2:
                connection = _a.sent();
                _a.label = 3;
            case 3:
                _a.trys.push([3, , 8, 9]);
                query = void 0;
                _a.label = 4;
            case 4:
                _a.trys.push([4, 6, , 7]);
                return [4 /*yield*/, oldPriceSchema.validate(req.query)];
            case 5:
                query = _a.sent();
                return [3 /*break*/, 7];
            case 6:
                err_2 = _a.sent();
                throw new HttpStatus.BadRequest(err_2.message);
            case 7:
                if (typeof query === 'undefined') {
                    throw new HttpStatus.InternalServerError('Could not cast querystring');
                }
                return [2 /*return*/, oldPrices_1.oldGetPrices(connection, query.courses, query.countryCode, query.provinceCode, query.discountAll, query.options)];
            case 8:
                connection.release();
                return [7 /*endfinally*/];
            case 9: return [2 /*return*/];
        }
    });
}); };
