/**
 * get-cloudinary-urls.js — Fetches all existing images from Cloudinary
 * and writes { filename: url } pairs to image-urls.json.
 *
 * Usage:
 *   node get-cloudinary-urls.js
 *
 * Requires in .env: CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 * Does NOT upload anything.
 */

require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");

const REQUIRED_ENV = ["CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const OUTPUT_FILE = path.join(__dirname, "image-urls.json");

/**
 * Fetches every resource in the account using cursor-based pagination.
 * Cloudinary's Admin API returns up to 500 results per page; we loop
 * until next_cursor is absent, meaning we've reached the last page.
 */
async function fetchAllResources() {
  const resources = [];
  let nextCursor = undefined;

  do {
    const response = await cloudinary.api.resources({
      resource_type: "image",
      type: "upload",
      max_results: 500,
      ...(nextCursor && { next_cursor: nextCursor }),
    });

    resources.push(...response.resources);
    nextCursor = response.next_cursor;

    console.log(`  Fetched ${resources.length} image(s) so far…`);
  } while (nextCursor);

  return resources;
}

async function main() {
  console.log("Connecting to Cloudinary…");

  let resources;
  try {
    resources = await fetchAllResources();
  } catch (err) {
    console.error("Cloudinary API error:", err.message ?? err);
    process.exit(1);
  }

  if (resources.length === 0) {
    console.log("No images found in your Cloudinary account.");
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify({}, null, 2));
    console.log(`Wrote empty result to ${OUTPUT_FILE}`);
    return;
  }

  // Build { original_filename: secure_url } map.
  // original_filename is what Cloudinary stored from the uploaded file's name.
  // If two files share a name (uploaded from different folders), the last one
  // wins — append public_id disambiguation only in that case.
  const result = {};
  for (const resource of resources) {
    const key = resource.original_filename;
    if (key in result) {
      // Disambiguate duplicates with the full public_id
      result[resource.public_id] = resource.secure_url;
    } else {
      result[key] = resource.secure_url;
    }
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2));
  console.log(`\nDone. ${resources.length} image(s) saved to ${OUTPUT_FILE}`);
}

main();
