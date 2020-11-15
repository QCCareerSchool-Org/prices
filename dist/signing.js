"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var crypto_1 = __importDefault(require("crypto"));
var fs_1 = __importDefault(require("fs"));
try {
    var privateKey_1 = fs_1.default.readFileSync('./private.pem', { encoding: 'utf8' });
    var publicKey_1 = fs_1.default.readFileSync('./public.pem', { encoding: 'utf8' });
    var createSignature = function (data) {
        var sign = crypto_1.default.createSign('SHA256');
        sign.update(data);
        return sign.sign({ key: privateKey_1, passphrase: 'CoUrSe123' }).toString('base64');
    };
    var verifySignature = function (data, signature) {
        var verify = crypto_1.default.createVerify('SHA256');
        verify.update(data);
        return verify.verify(publicKey_1, Buffer.from(signature, 'base64'));
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
    var oldDiscount = 150;
    var oldSig = createSignature(oldDiscount.toString());
    if (!verifySignature(oldDiscount.toString(), oldSig)) {
        throw Error('invalid signature');
    }
    // tslint:disable-next-line:no-console
    console.log(oldSig);
}
catch (err) {
    //
}
