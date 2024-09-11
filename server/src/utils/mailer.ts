import nodemailer from "nodemailer";
import { ENV_DATA } from "./envData";
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for port 465, false for other ports
  auth: {
    user: ENV_DATA.MAILER_NAME,
    pass: ENV_DATA.MAILER_PASSWORD,
  },
});

export default transporter;
