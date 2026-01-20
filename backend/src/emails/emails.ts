import { sendEmail } from "./mailer";
import { mailEnv } from "../validators/mailer.schema";
import { VERIFY_EMAIL_HTML_CONTENT } from "./templates/verifyEmailTemplate"

export const sendVerificationEmail = async (email: string, firstname: string, token: string): Promise<void> => {
  const verificationUrl = `${mailEnv.CLIENT_URL}/verify_email?token=${token}&email=${encodeURIComponent(email)}`;

  sendEmail({
    to: email,
    subject: "Verify Your Email - SwiftJonnyPOS",
    html: VERIFY_EMAIL_HTML_CONTENT
      .replace("{verificationUrl}", verificationUrl)
      .replace("{firstname}", firstname),
  });
};
