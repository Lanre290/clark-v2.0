const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: true,
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  export const sendOTP = async (email: string, name: string, otp: number) => {
    try {
      const mailOptions = {
        from: "Clark <no-reply@clarkai.com>",
        to: email,
        subject: "Verify your Clark account",
        html: `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <title>Verify your Clark account</title>
            <style>
                body {
                    font-family: 'Inter', sans-serif;
                    background-color: #ffffff;
                    margin: 0;
                    padding: 0;
                    color: #1d1d1f;
                }
                .banner {
                    width: 100%;
                    height: auto;
                    margin-bottom: 20px;
                    border-radius: 12px;
                }
                .container {
                    max-width: 520px;
                    margin: auto;
                    padding: 0px 0px 40px 0px;
                    border-radius: 12px;
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
                    background-color: #fff;
                    text-align: center;
                }
                h1 {
                    font-size: 24px;
                    font-weight: 600;
                    margin-bottom: 8px;
                }
                p {
                    font-size: 16px;
                    line-height: 1.6;
                    color: #444;
                }
                h1,p{
                    margin: 0 20px;
                }
                .otp {
                    margin: 30px auto;
                    display: inline-block;
                    font-size: 32px;
                    font-weight: 700;
                    letter-spacing: 4px;
                    background-color: #f5f5f5;
                    padding: 16px 28px;
                    border-radius: 10px;
                    color: #ff4a00;
                }
                .footer {
                    margin-top: 40px;
                    font-size: 14px;
                    color: #888;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <img src="https://res.cloudinary.com/dd75ybtpr/image/upload/v1743187133/Twitter_header_clark_htcteb.png" alt="Clark Banner" class="banner" />
                <h1>Hello ${name.split(" ")[0]},</h1>
                <p>Thanks for signing up to <strong>Clark</strong> — your personalized AI study assistant.</p>
                <p>Use the OTP below to verify your email and continue:</p>
                <div class="otp">${otp}</div>
                <p>If you didn’t request this, you can safely ignore it.</p>
                <div class="footer">
                    — The Clark Team
                </div>
            </div>
        </body>
        </html>`
      };
  
      transporter.sendMail(mailOptions, async (error: any, info: any) => {
        if (error) {
          console.log("error");
        } else {
          return true;
        }
      });
    } catch (error) {
      return "Error sending mail";
    }
  };