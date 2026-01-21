export const RESET_PASSWORD_HTML_CONTENT = `
  <html>
    <head>
      <style>
        a.reset-button:hover {
          background-color: #233ce3 !important;
        }
      </style>
    </head>
    <body style="font-family: sans-serif; line-height:1.6; background-color: #f4f4f4; padding: 20px;">
      <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #333;">Reset Your Password</h2>
        <p style="color: #555;">Dear {firstname},</p>
        <p style="color: #555;">We received a request to reset your password. Click the button below to create a new password:</p>
        <a 
          href="{resetUrl}" 
          class="reset-button"
          style="
            display: inline-block; 
            padding: 10px 20px; 
            background-color: #0070f3; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px;
            transition: ease-in-out 0.2s all;
          "
        >
          Reset Password
        </a>
        <p style="color: #555;">If you didn't request any password reset, please ignore this email.</p>
        <p style="color: #777; font-size: 0.9em;">Thank you.<br/> Your Team, SwiftJonny POS</p>
      </div>
    </body>
  </html>
`;

export const PASSWORD_RESET_SUCCESS_HTML_CONTENT = `
  <html>
    <head>
      <style>
        body {
          font-family: sans-serif;
          line-height: 1.6;
          background-color: #f4f4f4;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: auto;
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        h2 {
          color: #333;
        }
        p {
          color: #555;
        }
        .thank-you {
          font-size: 1.1em;
          color: #0070f3;
          font-weight: bold;
        }
        a {
          text-decoration: none;
          font-weight: bold;
          color: #0c6bd8;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Password Reset Successful!</h2>
        <p class="thank-you">Dear {firstname},</p>
        <p>Thank you for taking the time to secure your account. We're pleased to inform you that your password has been successfully reset.</p>
        <p>If you did not initiate this change, please reach out to our support team immediately.</p>
        <p>We're here to help and support you. If you have any further questions or need assistance, feel free to contact us.</p>
        <a href="tel:+233257266272">(+233) 0 257 2662 72</a>
        <p style="color: #777; font-size: 0.9em;">Warm regards,<br/> Your Team, SwiftJonny POS</p>
      </div>
    </body>
  </html>
`;

