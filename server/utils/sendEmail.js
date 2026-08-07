import transporter from "../config/mail.config.js";

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
      html,
    });

    return {
      success: true,
      message: info.messageId,
    };
  } catch (error) {
    console.error("Email Send Error", error);
    throw new Error("Failed to send email");
  }
};

export default sendEmail;
