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

    console.log(trackNumber, mailFrom, mailTo, mailFromPassword);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 800, height: 1600 });

    await page.goto("https://fozoco.com/pages/rastreio");

    await page.waitForSelector('#order_n');

    // Type into track input
    await page.type("#order_n", trackNumber);

    await page.click('button.btn-rastreio[type=submit]');

    await page.waitForSelector('.card-body-rastreio');

    // Locate the full title with a unique string
    const textSelector = await page.waitForFunction(
      "document.querySelector('.card-body-rastreio').innerText.includes('Aqui você conseguirá acompanhar todo o status do seu pedido') === true"
    );

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
      subject: "FOZOCO - Track order status",
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
