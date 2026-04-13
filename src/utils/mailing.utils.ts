// const nodemailer = require("nodemailer");

// export const transporter = nodemailer.createTransport({
//   host: process.env.MAIL_HOST,
//   port: Number(process.env.MAIL_PORT),
//   secure: process.env.MAIL_PORT === "465", // true for 465, false for 587
//   auth: {
//     user: process.env.MAIL_USERNAME,
//     pass: process.env.MAIL_PASSWORD,
//   },
// });


const SibApiV3Sdk = require('sib-api-v3-sdk');
const defaultClient = SibApiV3Sdk.ApiClient.instance;


const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

export const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
export const SibApiV3 = SibApiV3Sdk;