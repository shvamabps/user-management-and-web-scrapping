import nodemailer from "nodemailer";

export const CONFIG = {
  EMAIL_CONFIG: {
    emailAddress: process.env.OTP_VALIDATION_EMAIL, // need to provide this in the .env file
    password: process.env.OTP_VALIDATION_EMAIL_PASSWORD, // generate it here ---> https://myaccount.google.com/apppasswords
    port: 587,
    smtpHost: "smtp.gmail.com",
    secure: false,
  },
};

export const sendEmail = async (
  toEmail: string,
  subject: string,
  body: string
) => {
  const transporter = nodemailer.createTransport({
    host: CONFIG.EMAIL_CONFIG.smtpHost,
    port: CONFIG.EMAIL_CONFIG.port,
    secure: CONFIG.EMAIL_CONFIG.secure,
    auth: {
      user: CONFIG.EMAIL_CONFIG.emailAddress,
      pass: CONFIG.EMAIL_CONFIG.password,
    },
  });

  const info = await transporter.sendMail({
    from: CONFIG.EMAIL_CONFIG.emailAddress,
    to: toEmail,
    subject: subject,
    html: body,
  });
  return info;
};

export const generateOTP = (len?: number) => {
  const length = len || 6;
  const digits =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let OTP = "";
  for (let i = 0; i < length; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
};
