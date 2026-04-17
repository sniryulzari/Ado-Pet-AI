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

function buildAdoptionConfirmationHtml({ userName, petName, petType, petBreed, petImageUrl, action, frontendUrl }) {
  const isAdoption = action === "adopted";
  const actionLabel  = isAdoption ? "Adopted" : "Fostered";
  const subjectEmoji = isAdoption ? "🏠" : "🤗";
  const headerColor  = isAdoption ? "#ff4880" : "#393d72";
  const headlineVerb = isAdoption ? "Congratulations on Adopting" : "Thank You for Fostering";
  const bodyLine1    = isAdoption
    ? `You have officially adopted <strong style="color:#393d72;">${petName}</strong>! This is a huge moment — for you and for ${petName}.`
    : `You're now fostering <strong style="color:#393d72;">${petName}</strong>! Thank you for opening your home and giving ${petName} a safe, loving space.`;

  const nextSteps = isAdoption
    ? [
        { emoji: "📋", title: "Complete the paperwork", body: "Visit our shelter within 7 days to sign the adoption agreement." },
        { emoji: "🏥", title: "Schedule a vet check-up", body: "Book a vet visit within the first week to establish a health baseline." },
        { emoji: "🏠", title: "Pet-proof your home", body: "Secure loose cables, remove toxic plants, and set up a cosy corner for them." },
      ]
    : [
        { emoji: "📞", title: "Stay in touch", body: "Our foster team is here 24/7 — don't hesitate to call if you have questions." },
        { emoji: "🏥", title: "Medical care is covered", body: "We provide all veterinary care for foster pets. Just let us know if something comes up." },
        { emoji: "💛", title: "Update us with photos", body: "We love hearing how our foster pets are settling in — share updates anytime!" },
      ];

  const petImageSection = petImageUrl
    ? `<tr>
        <td align="center" style="padding: 0 40px 28px;">
          <img src="${petImageUrl}" alt="${petName}"
            style="width:100%;max-width:480px;height:260px;object-fit:cover;border-radius:14px;" />
        </td>
      </tr>`
    : "";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${headlineVerb} ${petName}!</title>
</head>
<body style="margin:0;padding:0;background-color:#f5efe7;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5efe7;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0"
          style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td align="center" style="background-color:${headerColor};padding:36px 40px 28px;">
              <p style="margin:0 0 6px;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.8);">
                ${subjectEmoji} ${actionLabel}
              </p>
              <h1 style="margin:0;font-size:38px;font-weight:900;color:#ffffff;letter-spacing:1px;">
                🐾 Ado-Pet
              </h1>
              <p style="margin:10px 0 0;font-size:16px;color:rgba(255,255,255,0.95);font-weight:600;">
                ${headlineVerb} ${petName}!
              </p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:36px 40px 20px;">
              <h2 style="margin:0 0 12px;font-size:22px;color:#393d72;font-weight:800;">
                Hi ${userName}! 🎉
              </h2>
              <p style="margin:0;font-size:15px;color:#858687;line-height:1.7;">
                ${bodyLine1}
              </p>
            </td>
          </tr>

          <!-- Pet details box -->
          <tr>
            <td style="padding:0 40px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background:#f5efe7;border-radius:12px;padding:20px 24px;">
                <tr>
                  <td>
                    <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#858687;">
                      Your new ${isAdoption ? "family member" : "foster"}
                    </p>
                    <p style="margin:0;font-size:22px;font-weight:900;color:#393d72;">${petName}</p>
                    <p style="margin:4px 0 0;font-size:13px;color:#858687;">${petType} &nbsp;·&nbsp; ${petBreed}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${petImageSection}

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;"><hr style="border:none;border-top:1px solid #f0e8df;margin:0;" /></td>
          </tr>

          <!-- Next steps -->
          <tr>
            <td style="padding:28px 40px 20px;">
              <span style="display:inline-block;background:${headerColor};color:#fff;
                font-size:11px;font-weight:700;letter-spacing:1.5px;
                text-transform:uppercase;border-radius:20px;padding:4px 14px;margin-bottom:14px;">
                ✅ Next Steps
              </span>
              <h3 style="margin:0 0 16px;font-size:18px;color:#393d72;font-weight:800;">
                What happens next?
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                ${nextSteps.map(({ emoji, title, body }) => `
                <tr>
                  <td style="padding-bottom:14px;vertical-align:top;padding-right:10px;font-size:20px;line-height:1.4;">${emoji}</td>
                  <td style="padding-bottom:14px;">
                    <strong style="color:#393d72;font-size:14px;">${title}</strong><br />
                    <span style="font-size:13px;color:#858687;line-height:1.6;">${body}</span>
                  </td>
                </tr>`).join("")}
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td align="center" style="background-color:#393d72;padding:28px 40px;">
              <h3 style="margin:0 0 10px;font-size:18px;color:#ffffff;font-weight:800;">
                Questions? We're always here for you.
              </h3>
              <a href="${frontendUrl}/contact"
                style="display:inline-block;background:#ff4880;color:#ffffff;
                  text-decoration:none;font-size:13px;font-weight:700;
                  text-transform:uppercase;letter-spacing:1px;
                  border-radius:20px;padding:12px 36px;">
                Contact Us →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:24px 40px;background-color:#f5efe7;">
              <p style="margin:0 0 4px;font-size:13px;color:#393d72;font-weight:700;">
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

async function sendAdoptionConfirmationEmail({ toEmail, userName, petName, petType, petBreed, petImageUrl, action }) {
  if (!process.env.BREVO_API_KEY) {
    console.warn("emailService: BREVO_API_KEY not configured — skipping adoption email");
    return;
  }

  const actionLabel = action === "adopted" ? "adopting" : "fostering";
  const apiInstance = getBrevoClient();
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.to = [{ email: toEmail }];
  sendSmtpEmail.sender = { email: process.env.EMAIL_FROM, name: "Ado-Pet" };
  sendSmtpEmail.subject = `Congratulations on ${actionLabel} ${petName}! 🐾`;
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  sendSmtpEmail.htmlContent = buildAdoptionConfirmationHtml({ userName, petName, petType, petBreed, petImageUrl, action, frontendUrl });

  await apiInstance.sendTransacEmail(sendSmtpEmail);
}

module.exports = { sendPasswordResetEmail, sendAdoptionConfirmationEmail };
