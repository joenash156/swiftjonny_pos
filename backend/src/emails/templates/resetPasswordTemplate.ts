export const RESET_PASSWORD_HTML_CONTENT = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          line-height: 1.6;
          background-color: #f8fafc;
          padding: 40px 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 16px;
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #65a30d 0%, #84cc16 100%);
          padding: 40px 30px;
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
          font-size: 28px;
          font-weight: 700;
          margin: 0;
        }
        .content {
          padding: 40px 30px;
          text-align: center;
        }
        .greeting {
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 16px;
        }
        .message {
          font-size: 15px;
          color: #64748b;
          margin-bottom: 32px;
          line-height: 1.8;
        }
        .reset-button {
          display: inline-block;
          padding: 16px 48px;
          background: linear-gradient(135deg, #65a30d 0%, #84cc16 100%);
          color: #ffffff;
          text-decoration: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 16px;
          transition: transform 0.2s ease;
          margin: 20px 0;
        }
        .reset-button:hover {
          transform: translateY(-2px);
        }
        .info-box {
          background-color: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 16px;
          margin: 32px 0;
          border-radius: 8px;
          text-align: left;
        }
        .info-box-title {
          font-size: 14px;
          font-weight: 600;
          color: #92400e;
          margin-bottom: 8px;
        }
        .info-box-text {
          font-size: 13px;
          color: #78350f;
        }
        .info-text {
          font-size: 13px;
          color: #94a3b8;
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
          <div class="logo">
            <div class="logo-icon">⚡</div>
            <span class="logo-text">SwiftJonny</span>
          </div>
          <h1 class="header-title">Reset Your Password</h1>
        </div>
        
        <div class="content">
          <p class="greeting">Hello {firstname}!</p>
          <p class="message">
            We received a request to reset the password for your SwiftJonny POS account.<br/>
            Click the button below to create a new password and regain access to your account.
          </p>
          
          <a href="{resetUrl}" class="reset-button">
            Reset Password
          </a>
          
          <div class="info-box">
            <div class="info-box-title">⚠️ Security Notice</div>
            <div class="info-box-text">
              This password reset link will expire in 1 hour for security reasons.
              If you didn't request this reset, please contact our support team immediately.
            </div>
          </div>
          
          <p class="info-text">
            If you didn't request a password reset, you can safely ignore this email.
            Your password will remain unchanged.
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
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          line-height: 1.6;
          background-color: #f8fafc;
          padding: 40px 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 16px;
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #65a30d 0%, #84cc16 100%);
          padding: 40px 30px;
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
        .success-icon {
          width: 64px;
          height: 64px;
          background-color: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          margin-bottom: 16px;
        }
        .header-title {
          color: #ffffff;
          font-size: 28px;
          font-weight: 700;
          margin: 0;
        }
        .content {
          padding: 40px 30px;
          text-align: center;
        }
        .greeting {
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 16px;
        }
        .message {
          font-size: 15px;
          color: #64748b;
          margin-bottom: 24px;
          line-height: 1.8;
        }
        .security-notice {
          background-color: #fef2f2;
          border-left: 4px solid #ef4444;
          padding: 16px;
          margin: 32px 0;
          border-radius: 8px;
          text-align: left;
        }
        .security-notice-title {
          font-size: 14px;
          font-weight: 600;
          color: #991b1b;
          margin-bottom: 8px;
        }
        .security-notice-text {
          font-size: 13px;
          color: #7f1d1d;
        }
        .support-box {
          background-color: #f1f5f9;
          padding: 24px;
          border-radius: 12px;
          margin: 32px 0;
        }
        .support-title {
          font-size: 15px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 12px;
        }
        .support-text {
          font-size: 14px;
          color: #64748b;
          margin-bottom: 16px;
        }
        .contact-link {
          display: inline-block;
          padding: 12px 24px;
          background-color: #65a30d;
          color: #ffffff;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          transition: background-color 0.2s ease;
        }
        .contact-link:hover {
          background-color: #84cc16;
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
          <div class="logo">
            <div class="logo-icon">⚡</div>
            <span class="logo-text">SwiftJonny</span>
          </div>
          <div class="success-icon">✓</div>
          <h1 class="header-title">Password Reset Successful!</h1>
        </div>
        
        <div class="content">
          <p class="greeting">Hello {firstname}!</p>
          <p class="message">
            We're pleased to confirm that your password has been successfully reset.
            You can now use your new password to access your SwiftJonny POS account.
          </p>
          
          <div class="security-notice">
            <div class="security-notice-title">🔒 Security Alert</div>
            <div class="security-notice-text">
              If you did not initiate this password change, please contact our support team immediately.
              Your account security is our top priority.
            </div>
          </div>
          
          <div class="support-box">
            <div class="support-title">Need Help?</div>
            <p class="support-text">
              Our support team is here to assist you with any questions or concerns.
              Feel free to reach out anytime.
            </p>
            <a href="tel:+233257266272" class="contact-link">
              📞 (+233) 0 257 2662 72
            </a>
          </div>
          
          <p class="message">
            Thank you for choosing SwiftJonny POS to power your business.
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

