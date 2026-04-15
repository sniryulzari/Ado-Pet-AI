const SibApiV3Sdk = require("sib-api-v3-sdk");
require("dotenv").config();

function getBrevoClient() {
  const defaultClient = SibApiV3Sdk.ApiClient.instance;
  const apiKey = defaultClient.authentications["api-key"];
  apiKey.apiKey = process.env.BREVO_API_KEY;
  return new SibApiV3Sdk.TransactionalEmailsApi();
}

function buildResetPasswordHtml(resetUrl) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your Ado-Pet Password</title>
</head>
<body style="margin:0;padding:0;background-color:#f5efe7;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5efe7;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0"
          style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td align="center" style="background-color:#ff4880;padding:36px 40px 28px;">
              <h1 style="margin:0;font-size:42px;font-weight:900;color:#ffffff;letter-spacing:1px;">
                🐾 Ado-Pet
              </h1>
              <p style="margin:10px 0 0;font-size:15px;color:rgba(255,255,255,0.9);">
                Password Reset Request
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px 24px;">
              <h2 style="margin:0 0 12px;font-size:24px;color:#393d72;font-weight:800;">
                Reset Your Password
              </h2>
              <p style="margin:0 0 20px;font-size:15px;color:#858687;line-height:1.7;">
                We received a request to reset the password for your Ado-Pet account.
                Click the button below to create a new password. This link is valid for
                <strong style="color:#393d72;">1 hour</strong>.
              </p>
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <a href="${resetUrl}"
                      style="display:inline-block;background:#ff4880;color:#ffffff;
                        text-decoration:none;font-size:14px;font-weight:700;
                        text-transform:uppercase;letter-spacing:1px;
                        border-radius:20px;padding:14px 36px;">
                      Reset Password →
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0;font-size:13px;color:#858687;line-height:1.6;">
                If the button doesn't work, copy and paste this link into your browser:<br />
                <a href="${resetUrl}" style="color:#ff4880;word-break:break-all;">${resetUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid #f0e8df;margin:0;" />
            </td>
          </tr>

          <!-- Security note -->
          <tr>
            <td style="padding:24px 40px;">
              <p style="margin:0;font-size:13px;color:#858687;line-height:1.6;">
                <strong style="color:#393d72;">Didn't request this?</strong><br />
                If you didn't request a password reset, you can safely ignore this email.
                Your password will remain unchanged.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:24px 40px;background-color:#f5efe7;">
              <p style="margin:0 0 6px;font-size:13px;color:#393d72;font-weight:700;">
                🐾 Ado-Pet Adoption Centre
              </p>
              <p style="margin:0;font-size:12px;color:#858687;">
                Daniel Frisch St. 3, Tel Aviv-Yafo &nbsp;|&nbsp;
                <a href="mailto:Ado-Pet@PetLover.com" style="color:#ff4880;text-decoration:none;">
                  Ado-Pet@PetLover.com
                </a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

async function sendPasswordResetEmail(toEmail, resetUrl) {
  if (!process.env.BREVO_API_KEY) {
    console.warn("emailService: BREVO_API_KEY not configured in .env");
    throw new Error("Email service not configured");
  }

  const apiInstance = getBrevoClient();
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.to = [{ email: toEmail }];
  sendSmtpEmail.sender = { email: process.env.EMAIL_FROM, name: "Ado-Pet" };
  sendSmtpEmail.subject = "Reset Your Ado-Pet Password 🐾";
  sendSmtpEmail.htmlContent = buildResetPasswordHtml(resetUrl);

  await apiInstance.sendTransacEmail(sendSmtpEmail);
}

module.exports = { sendPasswordResetEmail };
