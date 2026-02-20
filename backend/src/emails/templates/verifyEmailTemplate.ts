export const VERIFY_EMAIL_HTML_CONTENT = `
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link
      href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        font-family:
          "Poppins",
          -apple-system,
          BlinkMacSystemFont,
          "Segoe UI",
          sans-serif;
        line-height: 1.6;
        background-color: #f8fafc;
        padding: 40px 20px;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        border-radius: 8px;
        overflow: hidden;
      }
      .header {
        background: linear-gradient(135deg, #6cb00d 0%, #7bbe16 100%);
        padding: 20px 0;
        text-align: center;
      }
      .logo {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;
      }
      .logo-icon {
        width: 40px;
        height: 40px;
        background-color: rgba(255, 255, 255, 0.2);
        border-radius: 10px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
      }
      .logo-text {
        color: #ffffff;
        font-size: 20px;
        font-weight: 700;
        letter-spacing: 0.5px;
      }
      .header-title {
        color: #ffffff;
        font-size: 18px;
        font-weight: 600;
        margin: 0;
      }
      .content {
        padding: 40px 30px;
        text-align: center;
      }
      .greeting {
        font-size: 14px;
        font-weight: 600;
        color: #1e293b;
        margin-bottom: 16px;
        text-align: left;
      }
      .message {
        font-size: 14px;
        color: #64748b;
        margin-bottom: 32px;
        line-height: 1.8;
        text-align: left;
      }
      a.verify-button {
        display: inline-block;
        padding: 12px 48px;
        background: linear-gradient(135deg, #6cb00d 0%, #7bbe16 100%);
        color: #ffffff;
        text-decoration: none;
        border-radius: 5px;
        font-size: 14px;
        transition: transform 0.2s ease;
        margin: 20px 0;
        cursor: pointer;
      }

      a.verify-button:hover {
        transform: translateY(-2px);
      }

      a.verify-button:active {
        transform: translateY(0);
      }

      a.verify-button:focus {
        outline: 2px solid #4a7c0a;
        outline-offset: 2px;
      }
      .info-text {
        font-size: 13px;
        color: #da785e;
        margin-top: 32px;
        padding-top: 24px;
        border-top: 1px solid #e2e8f0;
      }
      .footer {
        background-color: #f8fafc;
        padding: 24px 30px;
        text-align: center;
      }
      .footer-text {
        font-size: 12px;
        color: #94a3b8;
        margin: 4px 0;
      }
      .footer-brand {
        font-weight: 600;
        color: #65a30d;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1 class="header-title">Verify Your Email</h1>
      </div>

      <div class="content">
        <p class="greeting">Hello {firstname}!</p>
        <p class="message">
          Thank you for choosing SwiftJonny POS. We're excited to have you on
          board!<br />
          To complete your registration and start managing your business, please
          verify your email address by clicking the button below.
        </p>

        <a href="{verificationUrl}" class="verify-button"> Verify Email </a>

        <p class="info-text">
          If you didn't create an account with SwiftJonny POS, you can safely
          ignore this email.
        </p>
      </div>

      <div class="footer">
        <p class="footer-text">
          © 2026 <span class="footer-brand">SwiftJonny POS</span>. All rights
          reserved.
        </p>
        <p class="footer-text">
          The modern point-of-sale solution for your business.
        </p>
      </div>
    </div>
  </body>
</html>
`;
