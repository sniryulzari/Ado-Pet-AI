const express = require("express");
const router  = express.Router();
const Pets    = require("../Schemas/petsSchemas");

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

router.get("/pet/:petId", async (req, res) => {
  const frontendPetUrl = `${FRONTEND_URL}/pet-details?petId=${req.params.petId}`;

  let pet;
  try {
    pet = await Pets.findById(req.params.petId).lean();
  } catch {
    return res.redirect(frontendPetUrl);
  }

  if (!pet) return res.redirect(frontendPetUrl);

  const isHypo =
    pet.hypoallergenic === true ||
    String(pet.hypoallergenic).toLowerCase() === "yes" ||
    String(pet.hypoallergenic).toLowerCase() === "true";

  const title       = escapeHtml(`🐾 Meet ${pet.name} — Available for ${pet.adoptionStatus === "Available" ? "Adoption" : pet.adoptionStatus}!`);
  const description = escapeHtml(
    `${pet.name} is a ${pet.color} ${pet.breed} ${pet.type} looking for a forever home. ` +
    `📏 ${pet.height}cm · ⚖️ ${pet.weight}kg · ${isHypo ? "✅ Hypoallergenic" : "❌ Not hypoallergenic"}` +
    (pet.bio ? ` — "${pet.bio}"` : "") +
    ` ❤️ Adopt or foster today on Ado-Pet!`
  );
  const image = escapeHtml(pet.imageUrl || "");
  const url   = escapeHtml(frontendPetUrl);

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>

  <!-- Open Graph (Facebook) -->
  <meta property="og:type"        content="website" />
  <meta property="og:url"         content="${url}" />
  <meta property="og:title"       content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image"       content="${image}" />
  <meta property="og:image:width"  content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:site_name"   content="Ado-Pet" />

  <!-- Twitter Card (bonus) -->
  <meta name="twitter:card"        content="summary_large_image" />
  <meta name="twitter:title"       content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image"       content="${image}" />

  <!-- Redirect real users to the SPA immediately -->
  <meta http-equiv="refresh" content="0; url=${url}" />
  <script>window.location.replace("${url}");</script>
</head>
<body>
  <p>Redirecting to <a href="${url}">${escapeHtml(pet.name)}'s profile</a>…</p>
</body>
</html>`);
});

module.exports = router;
