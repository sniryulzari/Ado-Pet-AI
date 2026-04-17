const SibApiV3Sdk = require("sib-api-v3-sdk");
require("dotenv").config();

function buildContactEmailHtml({ fullName, email, subject, message }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Contact Form Submission</title>
</head>
<body style="margin:0;padding:0;background-color:#f5efe7;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5efe7;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0"
          style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td align="center" style="background-color:#393d72;padding:32px 40px 24px;">
              <h1 style="margin:0;font-size:28px;font-weight:900;color:#ffffff;">
                🐾 Ado-Pet — New Message
              </h1>
              <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.8);">
                Contact form submission
              </p>
            </td>
          </tr>

          <!-- Subject badge -->
          <tr>
            <td style="padding:24px 40px 0;">
              <span style="display:inline-block;background:#ff4880;color:#fff;
                font-size:11px;font-weight:700;letter-spacing:1.5px;
                text-transform:uppercase;border-radius:20px;padding:4px 14px;">
                ${subject}
              </span>
            </td>
          </tr>

          <!-- Details -->
          <tr>
            <td style="padding:20px 40px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-bottom:14px;">
                    <p style="margin:0;font-size:12px;font-weight:700;text-transform:uppercase;
                      letter-spacing:1px;color:#858687;">From</p>
                    <p style="margin:4px 0 0;font-size:16px;color:#393d72;font-weight:700;">${fullName}</p>
                    <a href="mailto:${email}" style="font-size:14px;color:#ff4880;text-decoration:none;">${email}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:8px;border-top:1px solid #f0e8df;">
                    <p style="margin:12px 0 8px;font-size:12px;font-weight:700;text-transform:uppercase;
                      letter-spacing:1px;color:#858687;">Message</p>
                    <p style="margin:0;font-size:15px;color:#393d72;line-height:1.7;
                      white-space:pre-wrap;">${message}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:20px 40px;background-color:#f5efe7;">
              <p style="margin:0;font-size:12px;color:#858687;">
                Submitted via the Ado-Pet contact form · Reply directly to
                <a href="mailto:${email}" style="color:#ff4880;text-decoration:none;">${email}</a>
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

async function sendContactMessage(req, res) {
  const { fullName, email, subject, message } = req.body;

  if (!fullName || !email || !subject || !message) {
    return res.status(400).send("All fields are required");
  }
  if (message.length < 20) {
    return res.status(400).send("Message must be at least 20 characters");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).send("Invalid email address");
  }

  if (!process.env.BREVO_API_KEY) {
    console.warn("Contact: BREVO_API_KEY not configured");
    return res.status(503).send("Email service not configured");
  }

  try {
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications["api-key"];
    apiKey.apiKey = process.env.BREVO_API_KEY;

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.to = [{ email: process.env.EMAIL_FROM, name: "Ado-Pet Team" }];
    sendSmtpEmail.sender = { email: process.env.EMAIL_FROM, name: "Ado-Pet Contact Form" };
    sendSmtpEmail.replyTo = { email, name: fullName };
    sendSmtpEmail.subject = `[Contact] ${subject} — ${fullName}`;
    sendSmtpEmail.htmlContent = buildContactEmailHtml({ fullName, email, subject, message });

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    res.send({ ok: true });
  } catch (err) {
    console.error("Contact email error:", err.message);
    res.status(500).send("Failed to send message");
  }
}

module.exports = { sendContactMessage };
