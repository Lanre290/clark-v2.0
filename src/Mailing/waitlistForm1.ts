import { transporter } from "../utils/mailing.utils";

export const sendWaitlistForm1 = async (email: string, name: string) => {
    try {
      const mailOptions = {
        from: "Clark <no-reply@clarkai.com>",
        to: email,
        subject: "Help us shape Clark! (it’ll only take 2 mins 🧡)",
        html: `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <title>Help us shape Clark</title>
            <style>
                body {
                    font-family: 'Inter', sans-serif;
                    background-color: #ffffff;
                    margin: 0;
                    padding: 0;
                    color: #1d1d1f;
                }
                .container {
                    max-width: 520px;
                    margin: auto;
                    padding: 0 0 40px 0;
                    border-radius: 12px;
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
                    background-color: #fff;
                    text-align: center;
                }
                .banner {
                    width: 100%;
                    border-radius: 12px 12px 0 0;
                }
                h1 {
                    font-size: 24px;
                    font-weight: 600;
                    margin: 20px;
                }
                p {
                    font-size: 16px;
                    line-height: 1.6;
                    color: #444;
                    margin: 0 20px 16px;
                }
                a {
                    color: #ff4a00;
                    font-weight: 600;
                    text-decoration: none;
                }
                .footer {
                    margin-top: 30px;
                    font-size: 14px;
                    color: #888;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <img src="https://res.cloudinary.com/dd75ybtpr/image/upload/v1743187133/Twitter_header_clark_htcteb.png" alt="Clark Banner" class="banner" />
                <h1>Hey there, ${name.split(" ")[0]} 👋🏽</h1>
                <p>Thanks again for joining the <strong>Clark!</strong> waitlist. We’re building something special for students like you, and your input means a lot.</p>
                <p>We put together a quick form (literally 2 mins) to understand how you study, what tools you use, and what you’d want <strong>ClarkAI</strong> to help with.</p>
                <p>It’ll also help us understand you better, so we can build something that truly supports your learning.</p>
                <p><strong>👉 Fill it out here:</strong> <a style="color: #ff4a00" href="https://forms.gle/Y6LeUmxiMNG9nfW26">Take the 2-min survey</a></p>
                <p><strong>Wanna stay in the loop and build with us?</strong><br/>
                Join the Clark community here: <a style="color: #ff4a00" href="https://chat.whatsapp.com/CAfbsIBoNjGK8EnwT4yRv5">Join WhatsApp Group</a></p>
                <div class="footer">Appreciate you 🧡<br/>Dami<br/>From Team Clark!</div>
            </div>
        </body>
        </html>`
      };
  
      transporter.sendMail(mailOptions, async (error: any, info: any) => {
        if (error) {
          console.log("error", error);
        } else {
          return true;
        }
      });
    } catch (error) {
      return "Error sending mail";
    }
  };
  