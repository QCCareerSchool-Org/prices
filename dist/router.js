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
exports.router = void 0;
// TODO: migrate from Joi to yup
const joi_1 = __importDefault(require("@hapi/joi"));
const express_1 = __importDefault(require("express"));
const HttpStatus = __importStar(require("@qccareerschool/http-status"));
const async_wrapper_1 = require("./async-wrapper");
const prices_1 = require("./prices");
const pool_1 = require("./pool");
const old_prices_1 = require("./old-prices");
const tuition_email_1 = require("./tuition-email");
// validate the parameters
const priceSchema = joi_1.default.object({
    courses: joi_1.default.array().default([]),
    countryCode: joi_1.default.string().length(2).required(),
    provinceCode: joi_1.default.string().max(3).allow(''),
    options: joi_1.default.object({
        noShipping: joi_1.default.boolean(),
        discountAll: joi_1.default.boolean(),
        discount: joi_1.default.object({
            default: joi_1.default.number().required(),
            CAD: joi_1.default.number(),
            USD: joi_1.default.number(),
            GBP: joi_1.default.number(),
            AUD: joi_1.default.number(),
            NZD: joi_1.default.number(),
        }),
        discountSignature: joi_1.default.string(),
        MMFreeMW: joi_1.default.boolean(),
        deluxeKit: joi_1.default.boolean(),
        portfolio: joi_1.default.boolean(),
        depositOverride: joi_1.default.object().pattern(/./, joi_1.default.number()),
        installmentsOverride: joi_1.default.number().min(1).max(24),
        studentDiscount: joi_1.default.boolean(),
        blackFriday2020: joi_1.default.boolean(),
        school: joi_1.default.string(),
    }).with('discount', 'discountSignature'),
});
const tuitionEmailSchema = priceSchema.keys({
    emailAddress: joi_1.default.string().required(),
    school: joi_1.default.string().required(),
});
const oldPriceSchema = joi_1.default.object().keys({
    courses: joi_1.default.array().default([]),
    countryCode: joi_1.default.string().length(2).required(),
    provinceCode: joi_1.default.string().max(3).allow(null).allow('').default(null),
    discountAll: joi_1.default.number(),
    options: joi_1.default.object().keys({
        discountAll: joi_1.default.boolean(),
        discount: joi_1.default.number().min(0),
        discountSignature: joi_1.default.string(),
        MMFreeMW: joi_1.default.boolean(),
        deluxeKit: joi_1.default.boolean(),
        portfolio: joi_1.default.boolean(),
        campaignId: joi_1.default.string().allow(''),
        discountCode: joi_1.default.string().allow(''),
        discountGBP: joi_1.default.number().min(0),
        discountSignatureGBP: joi_1.default.string(),
    }).with('discount', 'discountSignature').default({}),
    _: joi_1.default.number(),
});
exports.router = express_1.default.Router();
exports.router.get('/', async_wrapper_1.asyncWrapper(async (req, res) => {
    const connection = await (await pool_1.pool).getConnection();
    try {
        let prices;
        if (res.locals.apiVersion === 2) {
            let query;
            try {
                query = await priceSchema.validateAsync(req.query);
            }
            catch (err) {
                throw new HttpStatus.BadRequest(err.message);
            }
            prices = await prices_1.getPrices(connection, query.courses, query.countryCode, query.provinceCode, query.options);
        }
        else if (res.locals.apiVersion === 1) {
            console.log('Old prices function called', req.headers.origin);
            let query;
            try {
                query = await oldPriceSchema.validateAsync(req.query);
            }
            catch (err) {
                throw new HttpStatus.BadRequest(err.message);
            }
            prices = await old_prices_1.oldGetPrices(connection, query.courses, query.countryCode, query.provinceCode, query.discountAll, query.options);
        }
        res.setHeader('Cache-Control', 'public, max-age=300'); // five minutes
        res.send(prices);
    }
    finally {
        connection.release();
    }
}));
exports.router.post('/tuitionEmail', async_wrapper_1.asyncWrapper(async (req, res) => {
    const connection = await (await pool_1.pool).getConnection();
    try {
        let body;
        try {
            body = await tuitionEmailSchema.validateAsync(req.body);
        }
        catch (err) {
            throw new HttpStatus.BadRequest(err.message);
        }
        const prices = await prices_1.getPrices(connection, body.courses, body.countryCode, body.provinceCode, body.options);
        await tuition_email_1.sendTuitionEmail(body.emailAddress, body.school, prices);
        res.end();
    }
    finally {
        connection.release();
    }
}));
