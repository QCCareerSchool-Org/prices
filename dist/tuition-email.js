"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTuitionEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
async function sendTuitionEmail(emailAddress, school, price) {
    const transport = nodemailer_1.default.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT ? parseInt(process.env.MAIL_PORT, 10) : undefined,
        secure: process.env.MAIL_SECURE === 'true',
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        },
    });
    const info = await transport.sendMail({
        from: '"Fred Foo 👻" <foo@example.com>',
        to: 'dave@qccareerschool.com',
        subject: 'Hello ✔',
        text: 'Hello world?',
        html: '<b>Hello world?</b>',
    });
}
exports.sendTuitionEmail = sendTuitionEmail;
