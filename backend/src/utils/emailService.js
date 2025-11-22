const nodemailer = require("nodemailer");

const isEmailConfigured = () =>
  Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure:
    process.env.SMTP_SECURE === "true" ||
    Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendPasswordResetEmail = async ({ to, otp }) => {
  if (!isEmailConfigured()) {
    throw new Error("SMTP credentials are not configured");
  }

  const subject = "Mã OTP đặt lại mật khẩu";
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
      <h2>Xin chào,</h2>
      <p>Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản tại hệ thống Football Booking.</p>
      <p>Mã OTP xác thực của bạn là:</p>
      <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; margin: 16px 0; color: #2563eb;">
        ${otp}
      </div>
      <p>Mã OTP có hiệu lực trong 10 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
      <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.</p>
      <p>Trân trọng,<br/>Đội ngũ Football Booking</p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
  });
};

module.exports = {
  sendPasswordResetEmail,
  isEmailConfigured,
};

