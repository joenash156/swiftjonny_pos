export const RESET_PASSWORD_HTML_CONTENT = `
<!doctype html>
<html>
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{
  font-family:"Poppins",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  background:#f8fafc;padding:40px 20px;
}
.container{max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;}
.header{
  background:linear-gradient(135deg,#0db08d 0%, #16be97ea 100%);
  padding:20px;text-align:center;
}
.header-title{color:#fff;font-size:18px;font-weight:600;}
.content{padding:40px 30px;text-align:center;}
.greeting{font-size:14px;font-weight:600;color:#1e293b;margin-bottom:16px;text-align:left;}
.message{font-size:14px;color:#64748b;margin-bottom:32px;line-height:1.8;text-align:left;}
a.reset-button{
  display:inline-block;padding:12px 48px;
  background:linear-gradient(135deg,#0db08d 0%, #16be97ea 100%);
  color:#fff;text-decoration:none;border-radius:5px;font-size:14px;margin:20px 0;
}
.info-box{
  background:#fef3c7;border-left:4px solid #f59e0b;
  padding:16px;margin:32px 0;border-radius:6px;text-align:left;
  font-size:13px;color:#92400e;
}
.info-text{
  font-size:13px;color:#94a3b8;margin-top:32px;
  padding-top:24px;border-top:1px solid #e2e8f0;text-align:left;
}
.footer{background:#f8fafc;padding:24px 30px;text-align:center;}
.footer-text{font-size:12px;color:#94a3b8;margin:4px 0;}
.footer-brand{font-weight:600;color:#0db08d;}
</style>
</head>

<body>
<div class="container">
  <div class="header">
    <h1 class="header-title">Reset Your Password</h1>
  </div>

  <div class="content">
    <p class="greeting">Hello {firstname}!</p>

    <p class="message">
      We received a request to reset your password.<br/>
      Click below to create a new one.
    </p>

    <a href="{resetUrl}" class="reset-button">Reset Password</a>

    <div class="info-box">
      <strong>Security Notice</strong><br/>
      This reset link expires in 1 hour.
    </div>

    <p class="info-text">
      If you didn't request this, you can ignore this email.
    </p>
  </div>

  <div class="footer">
    <p class="footer-text">© 2026 <span class="footer-brand">SwiftJonny POS</span>. All rights reserved.</p>
    <p class="footer-text">The modern point-of-sale solution for your business.</p>
  </div>
</div>
</body>
</html>
`;


export const PASSWORD_RESET_SUCCESS_HTML_CONTENT = `
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
        background: linear-gradient(135deg, #0db08d 0%, #16be97ea 100%);
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
        line-height: 1.8;
        text-align: left;
        margin-bottom: 24px;
      }
      .security-notice {
        background: #fef2f2;
        border-left: 4px solid #ef4444;
        padding: 16px;
        margin: 32px 0;
        border-radius: 6px;
        text-align: left;
        font-size: 13px;
        color: #991b1b;
      }
      a.contact-link {
        display: inline-block;
        padding: 12px 24px;
        background: linear-gradient(135deg, #0db08d 0%, #16be97ea 100%);
        color: #fff;
        text-decoration: none;
        border-radius: 5px;
        font-size: 14px;
        margin-bottom: 20px;
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
        <h1 class="header-title">Password Reset Successful</h1>
      </div>

      <div class="content">
        <p class="greeting">Hello {firstname}!</p>

        <p class="message">Your password has been successfully reset. You can now use your new password to access your account.</p>

        <div class="security-notice">
          <strong>Security Alert</strong><br />
          If you did not initiate this change, contact support immediately.
        </div>

        <a href="tel:+233257266272" class="contact-link">
          (+233) 0 257 2662 72
        </a>

        <p class="message">Thank you for choosing SwiftJonny POS.</p>
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