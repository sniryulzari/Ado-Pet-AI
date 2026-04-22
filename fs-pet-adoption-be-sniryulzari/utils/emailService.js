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
                Menachem Begin 121, Tel Aviv, 61st Floor &nbsp;|&nbsp;
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
  const headerColor   = isAdoption ? "#ff4880" : "#393d72";
  const accentColor   = isAdoption ? "#ff4880" : "#6c71c4";
  const headlineVerb  = isAdoption ? "You Did It!" : "You're a Hero!";
  const subHeadline   = isAdoption
    ? `${petName} has found their forever home — yours! 🏠`
    : `${petName} now has a warm place to stay — your home! 🤗`;
  const bodyLine1     = isAdoption
    ? `Pop the confetti — you've officially made <strong style="color:${accentColor};">${petName}</strong> part of your family! This is one of the greatest gifts you can give an animal, and we couldn't be more thrilled for you both.`
    : `You just changed a life! By opening your home to <strong style="color:${accentColor};">${petName}</strong>, you're giving them the love and safety every animal deserves. From the bottom of our hearts — thank you.`;

  const nextSteps = isAdoption
    ? [
        { emoji: "📋", title: "Complete the paperwork", body: "Visit our shelter within 7 days to sign the adoption agreement." },
        { emoji: "🏥", title: "Schedule a vet check-up", body: "Book a vet visit within the first week to establish a health baseline." },
        { emoji: "🏠", title: "Pet-proof your home", body: "Secure loose cables, remove toxic plants, and set up a cosy corner for them." },
        { emoji: "📸", title: "Share the joy!", body: "Post a photo of your new family member and tag us — we love celebrating adoptions!" },
      ]
    : [
        { emoji: "📞", title: "Stay in touch", body: "Our foster team is here 24/7 — don't hesitate to call if you have questions." },
        { emoji: "🏥", title: "Medical care is covered", body: "We provide all veterinary care for foster pets. Just let us know if something comes up." },
        { emoji: "💛", title: "Update us with photos", body: "We love hearing how our foster pets are settling in — share updates anytime!" },
        { emoji: "🐾", title: "Consider adopting", body: "If you fall in love, you can always make the foster official. No pressure — but the option is always open!" },
      ];

  const confettiColors = isAdoption
    ? ["#ff4880", "#ffae00", "#ff8c42", "#393d72", "#ff4880", "#00a277"]
    : ["#393d72", "#6c71c4", "#00a277", "#ffae00", "#ff4880", "#393d72"];

  const confettiDots = confettiColors.map((c, i) => {
    const sizes  = [8, 10, 6, 12, 7, 9];
    const lefts  = [5, 15, 28, 42, 57, 71, 82, 93];
    const tops   = [10, 25, 15, 35, 8, 28];
    return `<div style="position:absolute;width:${sizes[i]}px;height:${sizes[i]}px;background:${c};border-radius:50%;left:${lefts[i]}%;top:${tops[i]}%;opacity:0.75;"></div>`;
  }).join("");

  const petImageSection = petImageUrl
    ? `<tr>
        <td align="center" style="padding: 0 40px 28px;">
          <div style="position:relative;display:inline-block;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.18);">
            <img src="${petImageUrl}" alt="${petName}"
              style="width:100%;max-width:480px;height:280px;object-fit:cover;display:block;" />
            <div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,0.55));padding:20px 20px 16px;">
              <span style="color:#fff;font-size:20px;font-weight:900;text-shadow:0 2px 4px rgba(0,0,0,0.4);">${petName} 🐾</span>
            </div>
          </div>
        </td>
      </tr>`
    : "";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${headlineVerb} — ${petName} is yours!</title>
</head>
<body style="margin:0;padding:0;background-color:#f5efe7;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5efe7;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0"
          style="max-width:600px;width:100%;background-color:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.12);">

          <!-- Festive confetti header -->
          <tr>
            <td align="center" style="background:linear-gradient(135deg,${headerColor} 0%,${isAdoption ? "#ff8c42" : "#6c71c4"} 100%);padding:0;position:relative;overflow:hidden;">
              <div style="position:relative;padding:44px 40px 36px;overflow:hidden;">
                <!-- Confetti dots -->
                <div style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;">
                  ${confettiDots}
                </div>
                <!-- Big celebration emoji -->
                <div style="font-size:52px;margin-bottom:8px;line-height:1;">${isAdoption ? "🎉" : "💛"}</div>
                <h1 style="margin:0 0 6px;font-size:40px;font-weight:900;color:#ffffff;letter-spacing:1px;text-shadow:0 2px 8px rgba(0,0,0,0.2);">
                  ${headlineVerb}
                </h1>
                <p style="margin:0;font-size:16px;color:rgba(255,255,255,0.95);font-weight:600;line-height:1.5;">
                  ${subHeadline}
                </p>
                <div style="margin-top:14px;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.75);">
                  🐾 Ado-Pet
                </div>
              </div>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:36px 40px 20px;">
              <h2 style="margin:0 0 14px;font-size:24px;color:#393d72;font-weight:900;">
                Hey ${userName}! 🎊
              </h2>
              <p style="margin:0;font-size:15px;color:#555;line-height:1.8;">
                ${bodyLine1}
              </p>
            </td>
          </tr>

          <!-- Pet details pill badge -->
          <tr>
            <td style="padding:0 40px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background:linear-gradient(135deg,#f5efe7 0%,#fff0f5 100%);border-radius:14px;padding:22px 26px;border-left:5px solid ${accentColor};">
                <tr>
                  <td>
                    <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${accentColor};">
                      ${isAdoption ? "🏠 Your new family member" : "💛 Your foster pet"}
                    </p>
                    <p style="margin:0;font-size:26px;font-weight:900;color:#393d72;letter-spacing:-0.5px;">${petName}</p>
                    <p style="margin:6px 0 0;font-size:14px;color:#858687;">
                      <span style="background:#393d72;color:#fff;padding:2px 10px;border-radius:20px;font-size:12px;font-weight:700;">${petType}</span>
                      &nbsp; ${petBreed}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${petImageSection}

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;"><hr style="border:none;border-top:2px dashed #f0e8df;margin:0;" /></td>
          </tr>

          <!-- Next steps -->
          <tr>
            <td style="padding:32px 40px 20px;">
              <div style="display:inline-block;background:${accentColor};color:#fff;
                font-size:11px;font-weight:700;letter-spacing:1.5px;
                text-transform:uppercase;border-radius:20px;padding:5px 16px;margin-bottom:16px;">
                ✅ What's Next?
              </div>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                ${nextSteps.map(({ emoji, title, body }) => `
                <tr>
                  <td style="padding-bottom:18px;vertical-align:top;padding-right:12px;font-size:24px;line-height:1.3;width:36px;">${emoji}</td>
                  <td style="padding-bottom:18px;border-bottom:1px solid #f5efe7;">
                    <strong style="color:#393d72;font-size:14px;display:block;margin-bottom:3px;">${title}</strong>
                    <span style="font-size:13px;color:#858687;line-height:1.7;">${body}</span>
                  </td>
                </tr>`).join("")}
              </table>
            </td>
          </tr>

          <!-- Fun quote banner -->
          <tr>
            <td style="padding:0 40px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background:${accentColor};border-radius:14px;padding:22px 26px;">
                <tr>
                  <td align="center">
                    <p style="margin:0;font-size:16px;font-style:italic;color:#ffffff;line-height:1.7;font-weight:500;">
                      "${isAdoption
                        ? `Until one has loved an animal, a part of one's soul remains unawakened.`
                        : `The best thing about animals is that they don't ask questions — they just love.`}"
                    </p>
                    <p style="margin:8px 0 0;font-size:12px;color:rgba(255,255,255,0.75);">
                      ${isAdoption ? "— Anatole France" : "— Unknown"}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td align="center" style="background-color:#393d72;padding:32px 40px;">
              <h3 style="margin:0 0 6px;font-size:20px;color:#ffffff;font-weight:900;">
                We're always here for you 💙
              </h3>
              <p style="margin:0 0 18px;font-size:14px;color:rgba(255,255,255,0.75);">
                Questions, updates, or just want to share a cute photo?
              </p>
              <a href="${frontendUrl}/contact"
                style="display:inline-block;background:#ff4880;color:#ffffff;
                  text-decoration:none;font-size:13px;font-weight:700;
                  text-transform:uppercase;letter-spacing:1px;
                  border-radius:24px;padding:14px 40px;box-shadow:0 4px 14px rgba(255,72,128,0.4);">
                Say Hello →
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
                Menachem Begin 121, Tel Aviv, 61st Floor &nbsp;|&nbsp;
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

function buildVisitConfirmationHtml({ userName, petName, petType, petBreed, petImageUrl, date, timeSlot, notes, frontendUrl }) {
  const formattedDate = new Date(date).toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const petImageSection = petImageUrl
    ? `<tr>
        <td align="center" style="padding: 0 40px 28px;">
          <div style="position:relative;display:inline-block;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.15);">
            <img src="${petImageUrl}" alt="${petName}"
              style="width:100%;max-width:480px;height:260px;object-fit:cover;display:block;" />
            <div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,0.55));padding:16px 20px 14px;">
              <span style="color:#fff;font-size:20px;font-weight:900;text-shadow:0 2px 4px rgba(0,0,0,0.4);">${petName} 🐾</span>
            </div>
          </div>
        </td>
      </tr>`
    : "";

  const notesSection = notes
    ? `<tr>
        <td style="padding:0 40px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0"
            style="background:#fff8f0;border-radius:12px;padding:16px 20px;border-left:4px solid #ffae00;">
            <tr><td>
              <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#ffae00;">📝 Your Notes</p>
              <p style="margin:0;font-size:14px;color:#555;line-height:1.6;font-style:italic;">"${notes}"</p>
            </td></tr>
          </table>
        </td>
      </tr>`
    : "";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Visit Scheduled — Meet ${petName}!</title>
</head>
<body style="margin:0;padding:0;background-color:#f5efe7;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5efe7;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0"
          style="max-width:600px;width:100%;background-color:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.12);">

          <!-- Header -->
          <tr>
            <td align="center" style="background:linear-gradient(135deg,#393d72 0%,#6c71c4 100%);padding:44px 40px 36px;">
              <div style="font-size:52px;margin-bottom:8px;line-height:1;">📅</div>
              <h1 style="margin:0 0 6px;font-size:38px;font-weight:900;color:#ffffff;letter-spacing:1px;">
                You're All Set!
              </h1>
              <p style="margin:0;font-size:16px;color:rgba(255,255,255,0.92);font-weight:600;">
                Your visit with ${petName} is booked 🐾
              </p>
              <div style="margin-top:14px;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.65);">
                Ado-Pet
              </div>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:36px 40px 20px;">
              <h2 style="margin:0 0 12px;font-size:22px;color:#393d72;font-weight:900;">
                Hey ${userName}! 🎉
              </h2>
              <p style="margin:0;font-size:15px;color:#555;line-height:1.8;">
                We can't wait for you to meet <strong style="color:#393d72;">${petName}</strong>!
                Your visit has been confirmed — here are the details:
              </p>
            </td>
          </tr>

          <!-- Visit details card -->
          <tr>
            <td style="padding:0 40px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background:linear-gradient(135deg,#f5efe7 0%,#eef0fa 100%);border-radius:16px;overflow:hidden;">
                <!-- Date row -->
                <tr>
                  <td style="padding:18px 24px 12px;border-bottom:1px solid rgba(255,255,255,0.6);">
                    <p style="margin:0 0 3px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#858687;">📅 Date</p>
                    <p style="margin:0;font-size:18px;font-weight:900;color:#393d72;">${formattedDate}</p>
                  </td>
                </tr>
                <!-- Time row -->
                <tr>
                  <td style="padding:12px 24px 12px;border-bottom:1px solid rgba(255,255,255,0.6);">
                    <p style="margin:0 0 3px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#858687;">🕐 Time Slot</p>
                    <p style="margin:0;font-size:18px;font-weight:900;color:#393d72;">${timeSlot}</p>
                  </td>
                </tr>
                <!-- Pet row -->
                <tr>
                  <td style="padding:12px 24px 18px;">
                    <p style="margin:0 0 3px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#858687;">🐾 Meeting</p>
                    <p style="margin:0;font-size:18px;font-weight:900;color:#393d72;">${petName}</p>
                    <p style="margin:4px 0 0;font-size:13px;color:#858687;">
                      <span style="background:#393d72;color:#fff;padding:2px 10px;border-radius:20px;font-size:12px;font-weight:700;">${petType}</span>
                      &nbsp; ${petBreed}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${petImageSection}
          ${notesSection}

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;"><hr style="border:none;border-top:2px dashed #f0e8df;margin:0;" /></td>
          </tr>

          <!-- Tips -->
          <tr>
            <td style="padding:28px 40px 20px;">
              <div style="display:inline-block;background:#393d72;color:#fff;
                font-size:11px;font-weight:700;letter-spacing:1.5px;
                text-transform:uppercase;border-radius:20px;padding:5px 16px;margin-bottom:16px;">
                💡 Before You Come
              </div>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                ${[
                  ["📍", "Find us",        "Menachem Begin 121, Tel Aviv, 61st Floor. Parking is available on the street."],
                  ["👕", "Dress comfy",    "Wear clothes you don't mind getting a little furry — it's a sign of love!"],
                  ["🍖", "Bring a treat",  "We'll have snacks for ${petName} ready, but feel free to bring their favourite treat."],
                  ["📸", "Bring your phone", "You'll definitely want photos. Trust us."],
                ].map(([emoji, title, body]) => `
                <tr>
                  <td style="padding-bottom:16px;vertical-align:top;padding-right:12px;font-size:22px;line-height:1.3;width:32px;">${emoji}</td>
                  <td style="padding-bottom:16px;border-bottom:1px solid #f5efe7;">
                    <strong style="color:#393d72;font-size:14px;display:block;margin-bottom:3px;">${title}</strong>
                    <span style="font-size:13px;color:#858687;line-height:1.7;">${body}</span>
                  </td>
                </tr>`).join("")}
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td align="center" style="background-color:#393d72;padding:32px 40px;">
              <h3 style="margin:0 0 6px;font-size:18px;color:#ffffff;font-weight:900;">
                Need to reschedule or have questions?
              </h3>
              <p style="margin:0 0 18px;font-size:14px;color:rgba(255,255,255,0.75);">
                You can manage your visit from your account, or reach out to us.
              </p>
              <a href="${frontendUrl}/my-visits"
                style="display:inline-block;background:#ff4880;color:#ffffff;
                  text-decoration:none;font-size:13px;font-weight:700;
                  text-transform:uppercase;letter-spacing:1px;
                  border-radius:24px;padding:14px 36px;margin-right:10px;
                  box-shadow:0 4px 14px rgba(255,72,128,0.4);">
                My Visits →
              </a>
              <a href="${frontendUrl}/contact"
                style="display:inline-block;background:rgba(255,255,255,0.15);color:#ffffff;
                  text-decoration:none;font-size:13px;font-weight:700;
                  text-transform:uppercase;letter-spacing:1px;
                  border-radius:24px;padding:14px 36px;">
                Contact Us
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
                Menachem Begin 121, Tel Aviv, 61st Floor &nbsp;|&nbsp;
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

async function sendVisitConfirmationEmail({ toEmail, userName, petName, petType, petBreed, petImageUrl, date, timeSlot, notes }) {
  if (!process.env.BREVO_API_KEY) {
    console.warn("emailService: BREVO_API_KEY not configured — skipping visit email");
    return;
  }

  const apiInstance = getBrevoClient();
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.to = [{ email: toEmail }];
  sendSmtpEmail.sender = { email: process.env.EMAIL_FROM, name: "Ado-Pet" };
  sendSmtpEmail.subject = `Your visit with ${petName} is confirmed! 📅🐾`;
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  sendSmtpEmail.htmlContent = buildVisitConfirmationHtml({ userName, petName, petType, petBreed, petImageUrl, date, timeSlot, notes, frontendUrl });

  await apiInstance.sendTransacEmail(sendSmtpEmail);
}

module.exports = { sendPasswordResetEmail, sendAdoptionConfirmationEmail, sendVisitConfirmationEmail };
