import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";

export const sendMail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    service: "gmail",
    auth: {
      user: "saumilathya@gmail.com",
      pass: "kgil pnhn optu dkxe", 
    },
  });

  const { email, subject, template, data } = options;
  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  

  // Get the path to the email template file
  const templatePath = path.join(__dirname, "../mails", template);

  // Render the email template with EJS
  const html = await ejs.renderFile(templatePath, data);

  const mailOptions = {
    from: process.env.SMTP_MAIL,
    to: email,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};


