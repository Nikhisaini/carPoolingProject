import crypto from "crypto";
import OtpVerification from "../model/otpVerification.js";
import sendEmail from "./sendEmail.js";
import sendOtpTemplate from "./emailTemplates/sendOtpTemplate.js";

const sendOtp = async (userId, email, name, purpose = "REGISTER") => {
  const otp = crypto.randomInt(100000, 1000000).toString();

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await OtpVerification.findOneAndDelete({
    userId,
    purpose,
  });

  await OtpVerification.create({
    userId,
    otp,
    purpose,
    expiresAt,
  });

  await sendEmail({
    to: email,
    subject: "Verify Your Email",
    html: sendOtpTemplate({
      name,
      otp,
    }),
    text: `our OTP is ${otp}. It is valid for 10 minutes`,
  });
  return true;
};
export default sendOtp;
