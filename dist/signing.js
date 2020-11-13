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
const crypto_1 = __importDefault(require("crypto"));
const fs = __importStar(require("fs"));
try {
    const privateKey = fs.readFileSync('./private.pem', { encoding: 'utf8' });
    const publicKey = fs.readFileSync('./public.pem', { encoding: 'utf8' });
    const createSignature = (data) => {
        const sign = crypto_1.default.createSign('SHA256');
        sign.update(data);
        return sign.sign({ key: privateKey, passphrase: 'CoUrSe123' }).toString('base64');
    };
    const verifySignature = (data, signature) => {
        const verify = crypto_1.default.createVerify('SHA256');
        verify.update(data);
        return verify.verify(publicKey, Buffer.from(signature, 'base64'));
    };
    // const discount = {
    //   default: 200,
    //   GBP: 150,
    // };
    // const sig = createSignature(JSON.stringify(discount));
    // if (!verifySignature(JSON.stringify(discount), sig)) {
    //   throw Error('invalid signature');
    // }
    // // tslint:disable-next-line:no-console
    // console.log(sig);
    const oldDiscount = 150;
    const oldSig = createSignature(oldDiscount.toString());
    if (!verifySignature(oldDiscount.toString(), oldSig)) {
        throw Error('invalid signature');
    }
    // tslint:disable-next-line:no-console
    console.log(oldSig);
}
catch (err) {
    //
}
