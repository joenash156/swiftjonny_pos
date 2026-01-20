import { Resend } from "resend";
import { mailEnv } from "../validators/mailer.schema";

const resend = new Resend(mailEnv.RESEND_API_KEY);

export type SendEmailOptionsProps = {
  to: string;
  subject: string;
  html: string;
};

export const sendEmail = ({ to, subject, html }: SendEmailOptionsProps) => {
  try {
    resend.emails.send({
      from: mailEnv.MAIL_FROM,
      to,
      subject,
      html,
    });

    console.log(`Email sent to ${to}`);
    
  } catch (err) {
    console.error("Failed to send email:", err);
    throw new Error("Email sending failed");
  }
};
