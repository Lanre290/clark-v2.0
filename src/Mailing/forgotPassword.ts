import { transporter } from "../utils/mailing.utils";


export const sendForgotMail = async (
  resetLink: string,
  email: string,
  name: string
) => {
  try {
    const mailOptions = {
      from: "Clark <no-reply@clarkai.com>",
      to: email,
      subject: "Reset Your Clark Password",
      html: `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <title>Reset Password</title>
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
                  margin-bottom: 16px;
              }
              p {
                  font-size: 16px;
                  line-height: 1.6;
                  color: #444;
              }
              h1,p{
                  margin: 0 20px;
              }
              .button {
                  display: inline-block;
                  margin-top: 30px;
                  background-color: #ff4a00;
                  color: #fff;
                  text-decoration: none;
                  font-weight: 600;
                  font-size: 16px;
                  padding: 14px 24px;
                  border-radius: 8px;
                  margin-bottom: 30px;
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
              <h1>Reset your password</h1>
              <p>Hello ${name.split(" ")[0]},</p>
              <p>We received a request to reset your Clark account password. Click the button below to create a new one:</p>
              <a href="${resetLink}" class="button">Reset Password</a>
              <p>If you didn’t request this, feel free to ignore it — your current password will stay safe.</p>
              <p>This link will expire in 1 hour.</p>
              <div class="footer">
                  — The Clark Team
              </div>
          </div>
      </body>
      </html>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return true;
  } catch (error) {
    console.error("SendMail Error:", error);
    return "Error sending mail";
  }
};
