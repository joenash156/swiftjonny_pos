export const VERIFY_EMAIL_HTML_CONTENT = `
  <html>
    <head>
      <style>
        a.verify-button:hover {
          background-color: #233ce3 !important;
        }
      </style>
    </head>
    <body style="font-family: sans-serif; line-height:1.6;">
      <h2>Verify Your Email</h2>
      <p>Dear, {firstname}!</p>
      <p>Thank you for signing up! Click the button below to verify your email:</p>
      <a 
        href="{verificationUrl}" 
        class="verify-button"
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
        Verify Email
      </a>
      <p>If you didn't sign up, ignore this email.</p>
    </body>
  </html>
`;
