const SibApiV3Sdk = require('sib-api-v3-sdk');
const { saveSubscriberModel } = require("../Models/newsletterModel");
require("dotenv").config();

function buildEmailHtml(email, frontendUrl) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Ado-Pet Newsletter</title>
</head>
<body style="margin:0;padding:0;background-color:#f5efe7;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5efe7;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0"
          style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- ── Header ─────────────────────────────── -->
          <tr>
            <td align="center"
              style="background-color:#ff4880;padding:36px 40px 28px;">
              <p style="margin:0 0 6px;font-size:13px;font-weight:700;
                         letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.8);">
                Welcome to
              </p>
              <h1 style="margin:0;font-size:42px;font-weight:900;
                          color:#ffffff;letter-spacing:1px;">
                🐾 Ado-Pet
              </h1>
              <p style="margin:10px 0 0;font-size:15px;color:rgba(255,255,255,0.9);">
                Your home for pet adoption, fostering & animal love
              </p>
            </td>
          </tr>

          <!-- ── Welcome message ───────────────────── -->
          <tr>
            <td style="padding:36px 40px 24px;">
              <h2 style="margin:0 0 12px;font-size:24px;color:#393d72;font-weight:800;">
                You're officially part of the family! 🎉
              </h2>
              <p style="margin:0;font-size:15px;color:#858687;line-height:1.7;">
                Thank you for subscribing to the Ado-Pet newsletter. Every week we'll bring
                you heartwarming adoption stories, helpful pet care tips, and the latest news
                from our shelter. Together, we're giving animals the second chance they deserve.
              </p>
            </td>
          </tr>

          <!-- ── Divider ────────────────────────────── -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid #f0e8df;margin:0;" />
            </td>
          </tr>

          <!-- ── Pet of the Week ───────────────────── -->
          <tr>
            <td style="padding:28px 40px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <span style="display:inline-block;background:#ff4880;color:#fff;
                      font-size:11px;font-weight:700;letter-spacing:1.5px;
                      text-transform:uppercase;border-radius:20px;padding:4px 14px;
                      margin-bottom:12px;">
                      ⭐ Pet of the Week
                    </span>
                    <h3 style="margin:0 0 8px;font-size:20px;color:#393d72;font-weight:800;">
                      Meet Biscuit — This Week's Star!
                    </h3>
                    <p style="margin:0;font-size:14px;color:#858687;line-height:1.7;">
                      Biscuit is a 2-year-old Golden Retriever with a heart of gold and a tail
                      that never stops wagging. He loves morning runs, belly rubs, and absolutely
                      anyone who walks through the door. Biscuit has been with us for 3 weeks and
                      is ready to fill your home with joy.
                    </p>
                    <a href="${frontendUrl}/search"
                      style="display:inline-block;margin-top:16px;background:#ff4880;
                        color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;
                        text-transform:uppercase;letter-spacing:1px;
                        border-radius:20px;padding:10px 28px;">
                      Meet Biscuit →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── Divider ────────────────────────────── -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid #f0e8df;margin:0;" />
            </td>
          </tr>

          <!-- ── Adoption Tips ─────────────────────── -->
          <tr>
            <td style="padding:28px 40px 20px;">
              <span style="display:inline-block;background:#393d72;color:#fff;
                font-size:11px;font-weight:700;letter-spacing:1.5px;
                text-transform:uppercase;border-radius:20px;padding:4px 14px;
                margin-bottom:12px;">
                💡 Adoption Tips
              </span>
              <h3 style="margin:0 0 16px;font-size:20px;color:#393d72;font-weight:800;">
                3 Things to Prepare Before Bringing Your Pet Home
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-bottom:12px;vertical-align:top;padding-right:8px;
                    font-size:20px;line-height:1.4;">🏠</td>
                  <td style="padding-bottom:12px;">
                    <strong style="color:#393d72;font-size:14px;">Pet-proof your space</strong><br />
                    <span style="font-size:13px;color:#858687;line-height:1.6;">
                      Secure loose cables, move toxic plants out of reach, and designate a cosy
                      corner just for them.
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:12px;vertical-align:top;padding-right:8px;
                    font-size:20px;line-height:1.4;">🛒</td>
                  <td style="padding-bottom:12px;">
                    <strong style="color:#393d72;font-size:14px;">Stock up before day one</strong><br />
                    <span style="font-size:13px;color:#858687;line-height:1.6;">
                      Food, a water bowl, a bed, a leash or litter tray — having everything ready
                      reduces stress for both of you.
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="vertical-align:top;padding-right:8px;
                    font-size:20px;line-height:1.4;">🏥</td>
                  <td>
                    <strong style="color:#393d72;font-size:14px;">Book a vet check-up</strong><br />
                    <span style="font-size:13px;color:#858687;line-height:1.6;">
                      Schedule a visit within the first week to establish a health baseline and
                      get to know your local vet.
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── Divider ────────────────────────────── -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid #f0e8df;margin:0;" />
            </td>
          </tr>

          <!-- ── Upcoming Events ───────────────────── -->
          <tr>
            <td style="padding:28px 40px 20px;background-color:#fdf7f0;">
              <span style="display:inline-block;background:#ffae00;color:#fff;
                font-size:11px;font-weight:700;letter-spacing:1.5px;
                text-transform:uppercase;border-radius:20px;padding:4px 14px;
                margin-bottom:12px;">
                📅 Upcoming Events
              </span>
              <h3 style="margin:0 0 16px;font-size:20px;color:#393d72;font-weight:800;">
                What's On at the Shelter
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-bottom:14px;">
                    <p style="margin:0;font-size:13px;font-weight:700;color:#ff4880;">
                      🐕 Adoption Open Day — April 20
                    </p>
                    <p style="margin:4px 0 0;font-size:13px;color:#858687;line-height:1.5;">
                      Come meet our animals, tour the shelter, and learn about the adoption
                      process from our team. Free entry, family welcome.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:14px;">
                    <p style="margin:0;font-size:13px;font-weight:700;color:#ff4880;">
                      🎨 Kids & Pets Workshop — April 27
                    </p>
                    <p style="margin:4px 0 0;font-size:13px;color:#858687;line-height:1.5;">
                      A supervised afternoon for children to learn how to interact safely and
                      lovingly with animals. Ages 5–12. Limited spots.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <p style="margin:0;font-size:13px;font-weight:700;color:#ff4880;">
                      🏃 Charity Fun Run — May 4
                    </p>
                    <p style="margin:4px 0 0;font-size:13px;color:#858687;line-height:1.5;">
                      Run 5 km with your pet (or borrow one of ours!) and help raise funds for
                      veterinary care. Registration open now.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── Foster Highlight ──────────────────── -->
          <tr>
            <td style="padding:28px 40px 20px;">
              <span style="display:inline-block;background:#393d72;color:#fff;
                font-size:11px;font-weight:700;letter-spacing:1.5px;
                text-transform:uppercase;border-radius:20px;padding:4px 14px;
                margin-bottom:12px;">
                🏡 Foster Program
              </span>
              <h3 style="margin:0 0 8px;font-size:20px;color:#393d72;font-weight:800;">
                You Don't Have to Adopt to Change a Life
              </h3>
              <p style="margin:0 0 16px;font-size:14px;color:#858687;line-height:1.7;">
                Fostering is the backbone of what we do. Every foster family frees up a shelter
                space, gives a pet stability, and often — just often — ends up adopting anyway.
                We provide food, medical care, and 24/7 support. You provide the love.
              </p>
              <a href="${frontendUrl}/about"
                style="display:inline-block;background:#393d72;color:#ffffff;
                  text-decoration:none;font-size:13px;font-weight:700;
                  text-transform:uppercase;letter-spacing:1px;
                  border-radius:20px;padding:10px 28px;">
                Learn About Fostering →
              </a>
            </td>
          </tr>

          <!-- ── Divider ────────────────────────────── -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid #f0e8df;margin:0;" />
            </td>
          </tr>

          <!-- ── Heartwarming Story ─────────────────── -->
          <tr>
            <td style="padding:28px 40px 20px;">
              <span style="display:inline-block;background:#ff4880;color:#fff;
                font-size:11px;font-weight:700;letter-spacing:1.5px;
                text-transform:uppercase;border-radius:20px;padding:4px 14px;
                margin-bottom:12px;">
                💛 Adoption Story
              </span>
              <h3 style="margin:0 0 8px;font-size:20px;color:#393d72;font-weight:800;">
                "Sage Saved Me Right Back"
              </h3>
              <p style="margin:0;font-size:14px;color:#858687;line-height:1.8;font-style:italic;">
                "After losing my horse of 18 years, I didn't think I'd ever be ready again.
                Ado-Pet never rushed me. They matched me with Sage — a rescued mare who was
                just as nervous as I was. We've spent the last year healing together, trail by
                trail. I'm not sure who saved whom."
              </p>
              <p style="margin:12px 0 0;font-size:13px;font-weight:700;color:#ff4880;">
                — Rachel M., Scottsdale, AZ
              </p>
            </td>
          </tr>

          <!-- ── CTA Banner ─────────────────────────── -->
          <tr>
            <td align="center"
              style="background-color:#393d72;padding:28px 40px;">
              <h3 style="margin:0 0 10px;font-size:20px;color:#ffffff;font-weight:800;">
                Ready to find your perfect match?
              </h3>
              <a href="${frontendUrl}/search"
                style="display:inline-block;background:#ff4880;color:#ffffff;
                  text-decoration:none;font-size:13px;font-weight:700;
                  text-transform:uppercase;letter-spacing:1px;
                  border-radius:20px;padding:12px 36px;">
                Browse Pets Now →
              </a>
            </td>
          </tr>

          <!-- ── Footer ─────────────────────────────── -->
          <tr>
            <td align="center"
              style="padding:24px 40px;background-color:#f5efe7;">
              <p style="margin:0 0 6px;font-size:13px;color:#393d72;font-weight:700;">
                🐾 Ado-Pet Adoption Centre
              </p>
              <p style="margin:0 0 4px;font-size:12px;color:#858687;">
                Daniel Frisch St. 3, Tel Aviv-Yafo &nbsp;|&nbsp;
                <a href="mailto:Ado-Pet@PetLover.com"
                  style="color:#ff4880;text-decoration:none;">
                  Ado-Pet@PetLover.com
                </a>
              </p>
              <p style="margin:12px 0 0;font-size:11px;color:#aaaaaa;line-height:1.6;">
                You're receiving this email because <strong>${email}</strong> subscribed to
                the Ado-Pet newsletter.<br />
                <a href="${frontendUrl}"
                  style="color:#ff4880;text-decoration:none;">
                  Unsubscribe
                </a>
                &nbsp;·&nbsp;
                <a href="${frontendUrl}"
                  style="color:#ff4880;text-decoration:none;">
                  Privacy Policy
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

async function subscribe(req, res) {
  const { email } = req.body;

  // Basic email format sanity-check on the backend (frontend also validates)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).send("Invalid email address");
  }

  if (!process.env.BREVO_API_KEY) {
    console.warn("Newsletter: BREVO_API_KEY not configured in .env");
    return res.status(503).send("Email service not configured");
  }

  try {
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.BREVO_API_KEY;

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.to = [{ email }];
    sendSmtpEmail.sender = { email: process.env.EMAIL_FROM, name: 'Ado-Pet' };
    sendSmtpEmail.subject = 'Welcome to Ado-Pet Newsletter! 🐾';
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    sendSmtpEmail.htmlContent = buildEmailHtml(email, frontendUrl);

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    // Persist subscriber after successful email — if the email fails we don't
    // record them, which avoids orphaned DB entries for unconfirmed addresses.
    await saveSubscriberModel(email);
    res.send({ ok: true });
  } catch (err) {
    console.error("Newsletter email error:", err.message);
    res.status(500).send("Failed to send email");
  }
}

module.exports = { subscribe };
