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
        background: #f8fafc;
        padding: 40px 20px;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background: #fff;
        border-radius: 8px;
        overflow: hidden;
      }
      .header {
        background: linear-gradient(135deg, #0db08d 0%, #16be97 100%);
        padding: 20px;
        text-align: center;
      }
      .header-title {
        color: #fff;
        font-size: 18px;
        font-weight: 600;
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
        background: linear-gradient(135deg, #0db08d 0%, #16be97 100%);
        color: #fff;
        text-decoration: none;
        border-radius: 5px;
        font-size: 14px;
        margin: 20px 0;
      }
      .info-text {
        font-size: 13px;
        color: #da785e;
        margin-top: 32px;
        padding-top: 24px;
        border-top: 1px solid #e2e8f0;
        text-align: left;
      }
      .footer {
        background: #f8fafc;
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
        color: #0db08d;
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

        <a href="{verificationUrl}" class="verify-button">Verify Email</a>

        <p class="info-text">
          If you didn't create an account, you can safely ignore this email.
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