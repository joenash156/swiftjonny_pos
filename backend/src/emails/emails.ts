import { sendEmail } from "./mailer";
import { mailEnv } from "../validators/mailer.schema";
import { VERIFY_EMAIL_HTML_CONTENT } from "./templates/verifyEmailTemplate"
import { PASSWORD_RESET_SUCCESS_HTML_CONTENT, RESET_PASSWORD_HTML_CONTENT } from "./templates/resetPasswordTemplate";

export const sendVerificationEmail = async (email: string, firstname: string, token: string): Promise<void> => {
  const verificationUrl = `${mailEnv.CLIENT_URL}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

  sendEmail({
    to: email,
    subject: "Verify Your Email - SwiftJonny POS",
    html: VERIFY_EMAIL_HTML_CONTENT
      .replace("{verificationUrl}", verificationUrl)
      .replace("{firstname}", firstname),
  });
};

export const sendResetPasswordEmail = async (email: string, firstname: string, token: string): Promise<void> => {

  const resetUrl = `${mailEnv.CLIENT_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

  sendEmail({
    to: email,
    subject: "Reset your password - SwiftJonny POS",
    html: RESET_PASSWORD_HTML_CONTENT 
      .replace("{firstname}", firstname)
      .replace("{resetUrl}", resetUrl),
  });
}

export const sendResetPasswordSuccessEmail = async (email: string, firstname: string): Promise<void> => {

  sendEmail({
    to: email,
    subject: "Reset password was successful - SwiftJonny POS",
    html: PASSWORD_RESET_SUCCESS_HTML_CONTENT 
      .replace("{firstname}", firstname)
  });
}
