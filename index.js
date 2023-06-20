import puppeteer from "puppeteer";
import nodemailer from "nodemailer";
import dotenv from 'dotenv';
dotenv.config();

(async () => {
  try {
    const trackNumber = process.env.TRACK_NUMBER;
    const mailFrom = process.env.MAIL_FROM;
    const mailFromPassword = process.env.MAIL_FROM_PASSWORD;
    const mailTo = process.env.MAIL_TO;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 800, height: 1600 });

    await page.goto(`https://rastreae.com.br/resultado/${trackNumber}?utm_source=rastreamento&utm_medium=email&utm_campaign=postado`);

    await page.waitForSelector('.track-package');

    const screenshotBuffer = await page.screenshot();

    await browser.close();

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: mailFrom,
        pass: mailFromPassword,
      },
    });

    const mailOptions = {
      from: mailFrom,
      to: mailTo,
      subject: "Rastrea - Track order status",
      text: "Please find the screenshot attached with the current status of the order.",
      attachments: [
        {
          filename: "screenshot.png",
          content: screenshotBuffer,
        },
      ],
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Error:", error);
  }
})();
