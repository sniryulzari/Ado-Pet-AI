/**
 * seed-from-images.js
 *
 * Uploads local pet images to Cloudinary and inserts new pet records into MongoDB.
 * Does NOT clear existing data — only appends new pets.
 *
 * Usage:
 *   node seed-from-images.js
 *
 * Requires MONGO_URI, CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env
 */

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const Pets = require("./Schemas/petsSchemas");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("Missing MONGO_URI in .env");
  process.exit(1);
}

const IMAGES_ROOT = path.join(process.env.HOME, "Downloads", "חיות");

// ---------------------------------------------------------------------------
// Pet metadata — one entry per image, ordered to match sorted filenames
// ---------------------------------------------------------------------------

const dogsMeta = [
  { name: "Aztec",      breed: "Xoloitzcuintli",        color: "Hairless Black",            height: 50, weight: 14, hypoallergenic: "Yes", dietaryRestrictions: "High-calorie diet", adoptionStatus: "Available", bio: "Aztec is a rare hairless Xoloitzcuintli with an ancient lineage. He is loyal, calm, and hypoallergenic — perfect for allergy sufferers." },
  { name: "Hiro",       breed: "Akita",                  color: "Brindle",                   height: 66, weight: 40, hypoallergenic: "No",  dietaryRestrictions: "No restrictions",    adoptionStatus: "Fostered",  bio: "Hiro is a dignified Akita with a calm presence. He is deeply loyal to his family and best suited for experienced owners." },
  { name: "Koda",       breed: "Alaskan Malamute",       color: "Gray and White",             height: 64, weight: 38, hypoallergenic: "No",  dietaryRestrictions: "No restrictions",    adoptionStatus: "Available", bio: "Koda is a powerful Alaskan Malamute built for cold climates. He loves to pull, hike, and play in the snow with his family." },
  { name: "Buddy",      breed: "Australian Shepherd",    color: "Red Merle",                  height: 52, weight: 25, hypoallergenic: "No",  dietaryRestrictions: "No restrictions",    adoptionStatus: "Fostered",  bio: "Buddy is a bright and agile Australian Shepherd who thrives with a job to do. He is happiest when playing frisbee or learning new tricks." },
  { name: "Blaze",      breed: "Basenji",                color: "Red and White",              height: 43, weight: 11, hypoallergenic: "No",  dietaryRestrictions: "No restrictions",    adoptionStatus: "Available", bio: "Blaze is a sleek Basenji who rarely barks — instead he yodels! He is curious, independent, and loves agility courses." },
  { name: "Tux",        breed: "Boston Terrier",         color: "Black and White",            height: 38, weight: 9,  hypoallergenic: "No",  dietaryRestrictions: "No restrictions",    adoptionStatus: "Available", bio: "Tux is a dapper Boston Terrier with a tuxedo coat. He is friendly, low-maintenance, and perfectly suited for apartment life." },
  { name: "Brody",      breed: "Boxer",                  color: "Brindle",                    height: 60, weight: 32, hypoallergenic: "No",  dietaryRestrictions: "No restrictions",    adoptionStatus: "Available", bio: "Brody is a playful Boxer who thinks he is a lap dog. He is fearless, affectionate, and endlessly entertaining." },
  { name: "Ruby",       breed: "Cavalier King Charles Spaniel", color: "Chestnut and White", height: 32, weight: 7,  hypoallergenic: "No",  dietaryRestrictions: "No restrictions",    adoptionStatus: "Available", bio: "Ruby is a gentle Cavalier who lives to cuddle. She is wonderful with children and gets along with every dog she meets." },
  { name: "Fluffy",     breed: "Bichon Frise",           color: "White",                      height: 28, weight: 5,  hypoallergenic: "Yes", dietaryRestrictions: "No restrictions",    adoptionStatus: "Available", bio: "Fluffy is a cloud-like Bichon Frise who is 100% hypoallergenic. She is cheerful, adaptable, and loves to perform tricks." },
  { name: "Peanut",     breed: "Pembroke Welsh Corgi",   color: "Sable and White",            height: 30, weight: 13, hypoallergenic: "No",  dietaryRestrictions: "No restrictions",    adoptionStatus: "Available", bio: "Peanut is a low-rider Corgi with a huge personality. He herds anything that moves and steals every heart in the room." },
  { name: "Churchill",  breed: "English Bulldog",        color: "White and Brindle",          height: 36, weight: 25, hypoallergenic: "No",  dietaryRestrictions: "Soft food recommended", adoptionStatus: "Available", bio: "Churchill is a wrinkly English Bulldog who prefers naps to runs. He is devoted, easygoing, and a champion snuggler." },
  { name: "Blade",      breed: "Doberman Pinscher",      color: "Black and Rust",             height: 68, weight: 38, hypoallergenic: "No",  dietaryRestrictions: "No restrictions",    adoptionStatus: "Fostered",  bio: "Blade is a sleek Doberman who is alert and highly trainable. He is gentle with his family and an excellent watchdog." },
  { name: "Coco",       breed: "Standard Poodle",        color: "Brown",                      height: 55, weight: 28, hypoallergenic: "Yes", dietaryRestrictions: "No restrictions",    adoptionStatus: "Available", bio: "Coco is a hypoallergenic Standard Poodle of exceptional intelligence. She learns commands in minutes and loves water." },
  { name: "Sandy",      breed: "American Cocker Spaniel", color: "Buff",                      height: 38, weight: 12, hypoallergenic: "No",  dietaryRestrictions: "No restrictions",    adoptionStatus: "Available", bio: "Sandy is a sweet Cocker Spaniel with silky ears and a gentle heart. She loves everyone and thrives in a caring home." },
  { name: "Diesel",     breed: "Labrador Retriever",     color: "Black",                      height: 57, weight: 32, hypoallergenic: "No",  dietaryRestrictions: "No restrictions",    adoptionStatus: "Available", bio: "Diesel is a powerful black Lab with the softest temperament. He is a natural therapy dog who loves every person he meets." },
  { name: "Sherlock",   breed: "Bloodhound",             color: "Black and Tan",              height: 66, weight: 50, hypoallergenic: "No",  dietaryRestrictions: "No restrictions",    adoptionStatus: "Available", bio: "Sherlock never loses a scent. This wrinkly Bloodhound is gentle, patient, and absolutely determined on every walk." },
  { name: "Polka",      breed: "Dalmatian",              color: "White with Black Spots",     height: 58, weight: 27, hypoallergenic: "No",  dietaryRestrictions: "Low-purine diet",    adoptionStatus: "Available", bio: "Polka is an athletic Dalmatian with a striking spotted coat. She is energetic, loyal, and loves running alongside cyclists." },
  { name: "Bella",      breed: "Yorkshire Terrier",      color: "Blue and Gold",              height: 20, weight: 3,  hypoallergenic: "No",  dietaryRestrictions: "No restrictions",    adoptionStatus: "Available", bio: "Bella is a tiny Yorkie who has no idea how small she is. She is bold, affectionate, and loves being the center of attention." },
  { name: "Fritz",      breed: "Miniature Schnauzer",    color: "Salt and Pepper",            height: 35, weight: 8,  hypoallergenic: "Yes", dietaryRestrictions: "No restrictions",    adoptionStatus: "Available", bio: "Fritz is a smart and spirited Miniature Schnauzer with a distinguished beard. He is hypoallergenic and great with children." },
  { name: "Ghost",      breed: "Weimaraner",             color: "Silver Gray",                height: 65, weight: 35, hypoallergenic: "No",  dietaryRestrictions: "No restrictions",    adoptionStatus: "Available", bio: "Ghost is a silver Weimaraner with piercing blue eyes. He is devoted to his owner and needs plenty of outdoor exercise." },
  { name: "Goliath",    breed: "Great Dane",             color: "Fawn",                       height: 82, weight: 65, hypoallergenic: "No",  dietaryRestrictions: "Large-breed formula", adoptionStatus: "Available", bio: "Goliath is a gentle giant Great Dane who thinks he is a lapdog. Despite his size he is the most gentle soul in the room." },
  { name: "Hunter",     breed: "Pointer",                color: "Liver and White",            height: 65, weight: 30, hypoallergenic: "No",  dietaryRestrictions: "No restrictions",    adoptionStatus: "Available", bio: "Hunter is a keen Pointer with incredible focus in the field and complete calm at home. He is the ultimate sporting companion." },
  { name: "Swift",      breed: "Whippet",                color: "Fawn",                       height: 51, weight: 12, hypoallergenic: "No",  dietaryRestrictions: "No restrictions",    adoptionStatus: "Available", bio: "Swift is a silky Whippet who can go from 0 to 55 km/h in seconds, then curl up on the sofa for the rest of the day." },
  { name: "Bingo",      breed: "Beagle",                 color: "Tricolor",                   height: 38, weight: 11, hypoallergenic: "No",  dietaryRestrictions: "No restrictions",    adoptionStatus: "Available", bio: "Bingo is a merry Beagle who follows his nose everywhere. He is great with kids and brings joy to every home he enters." },
  { name: "Storm",      breed: "Siberian Husky",         color: "Black and White",            height: 54, weight: 22, hypoallergenic: "No",  dietaryRestrictions: "No restrictions",    adoptionStatus: "Available", bio: "Storm is a striking Siberian Husky with piercing blue eyes. He is talkative, playful, and needs an active family to match his energy." },
  { name: "Copper",     breed: "Golden Retriever",       color: "Golden",                     height: 56, weight: 30, hypoallergenic: "No",  dietaryRestrictions: "No restrictions",    adoptionStatus: "Available", bio: "Copper is the quintessential Golden Retriever — kind, patient, and always smiling. He is brilliant with children and other dogs." },
  { name: "Tank",       breed: "Rottweiler",             color: "Black and Tan",              height: 65, weight: 45, hypoallergenic: "No",  dietaryRestrictions: "No restrictions",    adoptionStatus: "Available", bio: "Tank is a confident Rottweiler with a heart of gold. He is protective of his family, calm indoors, and loves daily training sessions." },
  { name: "Tiny",       breed: "Chihuahua",              color: "Tan",                        height: 20, weight: 2,  hypoallergenic: "No",  dietaryRestrictions: "Small-breed formula", adoptionStatus: "Available", bio: "Tiny is a feisty Chihuahua who fits in a bag but acts like he owns the room. He is spunky, loving, and fiercely loyal." },
  { name: "Snowball",   breed: "Maltese",                color: "White",                      height: 22, weight: 3,  hypoallergenic: "Yes", dietaryRestrictions: "No restrictions",    adoptionStatus: "Available", bio: "Snowball is a silky Maltese who never sheds. She is affectionate, playful, and hypoallergenic — a perfect companion for all ages." },
  { name: "Rusty",      breed: "Vizsla",                 color: "Golden Rust",                height: 62, weight: 30, hypoallergenic: "No",  dietaryRestrictions: "No restrictions",    adoptionStatus: "Available", bio: "Rusty is a velcro Vizsla who has to be touching his owner at all times. He is sensitive, energetic, and incredibly affectionate." },
  { name: "Irish",      breed: "Irish Setter",           color: "Deep Chestnut",              height: 67, weight: 30, hypoallergenic: "No",  dietaryRestrictions: "No restrictions",    adoptionStatus: "Available", bio: "Irish is a gorgeous Irish Setter with a flowing chestnut coat. He is playful, enthusiastic, and impossible not to fall in love with." },
  { name: "Nanook",     breed: "Alaskan Malamute",       color: "Sable and White",            height: 64, weight: 40, hypoallergenic: "No",  dietaryRestrictions: "High-protein diet",  adoptionStatus: "Available", bio: "Nanook is a majestic Malamute who loves cold weather and long hikes. He is friendly with people and thrives in an active household." },
  { name: "Bear",       breed: "Newfoundland",           color: "Black",                      height: 71, weight: 60, hypoallergenic: "No",  dietaryRestrictions: "Large-breed formula", adoptionStatus: "Available", bio: "Bear is a massive but tender Newfoundland known for rescuing swimmers. He is calm, gentle, and absolutely adores children." },
  { name: "Leo",        breed: "Leonberger",             color: "Lion Yellow",                height: 78, weight: 60, hypoallergenic: "No",  dietaryRestrictions: "Large-breed formula", adoptionStatus: "Fostered",  bio: "Leo is a lion-like Leonberger who is as gentle as he is grand. He loves water, mountains, and sitting next to his favourite person." },
  { name: "Ace",        breed: "Border Collie",          color: "Black and White",            height: 53, weight: 18, hypoallergenic: "No",  dietaryRestrictions: "No restrictions",    adoptionStatus: "Available", bio: "Ace is the smartest dog in every room. This Border Collie solves puzzles, reads emotions, and never stops moving." },
  { name: "Slim",       breed: "Italian Greyhound",      color: "Blue",                       height: 38, weight: 5,  hypoallergenic: "No",  dietaryRestrictions: "No restrictions",    adoptionStatus: "Available", bio: "Slim is an elegant Italian Greyhound who loves warmth and speed in equal measure. He is affectionate and needs a cozy home." },
  { name: "Butterfly",  breed: "Papillon",               color: "White and Brown",            height: 25, weight: 4,  hypoallergenic: "No",  dietaryRestrictions: "No restrictions",    adoptionStatus: "Available", bio: "Butterfly is a dainty Papillon with ear-wings that match her name. She is athletic, clever, and wins every agility competition." },
  { name: "Ajax",       breed: "Belgian Shepherd",       color: "Black",                      height: 62, weight: 28, hypoallergenic: "No",  dietaryRestrictions: "High-protein diet",  adoptionStatus: "Available", bio: "Ajax is a powerful Belgian Shepherd with drive and intelligence. He excels at protection sports and is devoted to his handler." },
  { name: "Chow",       breed: "Chow Chow",              color: "Red",                        height: 50, weight: 30, hypoallergenic: "No",  dietaryRestrictions: "No restrictions",    adoptionStatus: "Available", bio: "Chow is a regal, lion-faced Chow Chow who is fiercely loyal to one family. He is reserved with strangers but deeply devoted at home." },
  { name: "Wrinkle",    breed: "Shar-Pei",               color: "Fawn",                       height: 48, weight: 27, hypoallergenic: "No",  dietaryRestrictions: "Grain-free recommended", adoptionStatus: "Fostered",  bio: "Wrinkle is a unique Shar-Pei with a hippopotamus muzzle and a wrinkled coat. He is independent, loyal, and surprisingly good with kids." },
  { name: "Titan",      breed: "Cane Corso",             color: "Gray",                       height: 68, weight: 50, hypoallergenic: "No",  dietaryRestrictions: "Large-breed formula", adoptionStatus: "Available", bio: "Titan is a commanding Cane Corso with a calm demeanor. He is protective, trainable, and deeply bonded to his family." },
  { name: "Beau",       breed: "Harrier",                color: "Tricolor",                   height: 50, weight: 22, hypoallergenic: "No",  dietaryRestrictions: "No restrictions",    adoptionStatus: "Available", bio: "Beau is a friendly Harrier who loves nothing more than running through fields. He gets along with everyone, human or canine." },
  { name: "Winston",    breed: "Dachshund",              color: "Black and Tan",              height: 22, weight: 8,  hypoallergenic: "No",  dietaryRestrictions: "No restrictions",    adoptionStatus: "Available", bio: "Winston is a spirited Dachshund who approaches every challenge with stubborn determination. He is brave, affectionate, and endlessly amusing." },
  { name: "Cloud",      breed: "Samoyed",                color: "White",                      height: 56, weight: 25, hypoallergenic: "No",  dietaryRestrictions: "No restrictions",    adoptionStatus: "Available", bio: "Cloud is a snow-white Samoyed with a permanent smile. He is gentle, fluffy, and radiates pure happiness wherever he goes." },
  { name: "Yuki",       breed: "Shiba Inu",              color: "Cream",                      height: 38, weight: 9,  hypoallergenic: "No",  dietaryRestrictions: "No restrictions",    adoptionStatus: "Available", bio: "Yuki is a cream Shiba Inu who is as photogenic as he is spirited. He is fastidiously clean and bonds deeply with his person." },
  { name: "Louie",      breed: "French Bulldog",         color: "Cream",                      height: 30, weight: 12, hypoallergenic: "No",  dietaryRestrictions: "No rich food",       adoptionStatus: "Available", bio: "Louie is a city-smart French Bulldog who adapts to any lifestyle. He is low-energy indoors and makes an ideal apartment companion." },
  { name: "Bruno",      breed: "German Shepherd",        color: "Black and Tan",              height: 62, weight: 35, hypoallergenic: "No",  dietaryRestrictions: "No restrictions",    adoptionStatus: "Available", bio: "Bruno is a loyal and courageous German Shepherd with outstanding obedience training. He is devoted to his family and thrives with a purpose." },
];

const catsMeta = [
  { name: "Socks",     breed: "Domestic Shorthair",  color: "Black and White",        height: 25, weight: 4,   hypoallergenic: "No",  dietaryRestrictions: "No restrictions",        adoptionStatus: "Available", bio: "Socks is a classic tuxedo cat who strolls through life with quiet confidence. He is easygoing, clean, and loves watching the world from a windowsill." },
  { name: "Leo",       breed: "Maine Coon",           color: "Brown Tabby",            height: 32, weight: 8,   hypoallergenic: "No",  dietaryRestrictions: "No restrictions",        adoptionStatus: "Available", bio: "Leo is a majestic Maine Coon with tufted ears and a bushy tail. He is dog-like in personality, often greeting you at the door and following you room to room." },
  { name: "Marmalade", breed: "Domestic Shorthair",  color: "Orange Tabby",           height: 25, weight: 4.5, hypoallergenic: "No",  dietaryRestrictions: "No restrictions",        adoptionStatus: "Available", bio: "Marmalade is a sunny orange tabby who loves napping in warm patches of sunlight. He is gentle, undemanding, and perfectly content in any home." },
  { name: "Bao",       breed: "Burmese",              color: "Sable Brown",            height: 26, weight: 4.5, hypoallergenic: "No",  dietaryRestrictions: "No restrictions",        adoptionStatus: "Available", bio: "Bao is a sleek Burmese who bonds intensely with his person. He is talkative, affectionate, and follows you everywhere like a little shadow." },
  { name: "Charlie",   breed: "Scottish Fold",        color: "Silver Tabby",           height: 24, weight: 4.5, hypoallergenic: "No",  dietaryRestrictions: "No restrictions",        adoptionStatus: "Available", bio: "Charlie has the cutest folded ears and the calmest temperament. He sits like an owl and spends hours observing the household with quiet curiosity." },
  { name: "Freckles",  breed: "Bengal",               color: "Brown Spotted",          height: 28, weight: 5.5, hypoallergenic: "No",  dietaryRestrictions: "No restrictions",        adoptionStatus: "Fostered",  bio: "Freckles is a wild-looking Bengal who hunts toy mice with professional precision. He is athletic, brilliant, and endlessly stimulating to live with." },
  { name: "Pumpkin",   breed: "Persian Mix",          color: "Orange",                 height: 26, weight: 5,   hypoallergenic: "No",  dietaryRestrictions: "No restrictions",        adoptionStatus: "Available", bio: "Pumpkin is a round, fluffy Persian mix who loves being groomed. He is calm, decorative, and the perfect companion for a quiet home." },
  { name: "Kiki",      breed: "Siamese",              color: "Blue Point",             height: 25, weight: 4,   hypoallergenic: "No",  dietaryRestrictions: "No restrictions",        adoptionStatus: "Available", bio: "Kiki is a blue-point Siamese who will voice her opinions loudly and often. She forms an unbreakable bond with her favourite person." },
  { name: "Mocha",     breed: "Abyssinian",           color: "Ruddy Brown",            height: 26, weight: 4,   hypoallergenic: "No",  dietaryRestrictions: "No restrictions",        adoptionStatus: "Available", bio: "Mocha is an athletic Abyssinian who is always in motion. She explores every shelf, drawer, and corner of her home with insatiable curiosity." },
  { name: "Zigzag",    breed: "Tabby Mix",            color: "Classic Brown Tabby",    height: 25, weight: 4.2, hypoallergenic: "No",  dietaryRestrictions: "No restrictions",        adoptionStatus: "Available", bio: "Zigzag earned her name from her unpredictable running paths. She is playful, silly, and brings endless laughter to every household." },
  { name: "Ivy",       breed: "Russian Blue",         color: "Blue-Gray",              height: 25, weight: 4,   hypoallergenic: "No",  dietaryRestrictions: "No restrictions",        adoptionStatus: "Available", bio: "Ivy is a graceful Russian Blue who is shy at first but develops deep, lasting loyalty. She is serene, intelligent, and perfect for a calm home." },
  { name: "Blizzard",  breed: "Norwegian Forest Cat", color: "White and Gray",         height: 32, weight: 7,   hypoallergenic: "No",  dietaryRestrictions: "No restrictions",        adoptionStatus: "Available", bio: "Blizzard is a majestic Norwegian Forest Cat who looks like he walked out of a Norse fairy tale. He is independent but always present." },
  { name: "Nugget",    breed: "Domestic Longhair",    color: "Golden",                 height: 26, weight: 4.5, hypoallergenic: "No",  dietaryRestrictions: "No restrictions",        adoptionStatus: "Fostered",  bio: "Nugget is a golden long-haired cat who melts into your lap. She is gentle, quiet, and ideal for a household that enjoys peaceful company." },
  { name: "Mango",     breed: "Ocicat",               color: "Tawny Spotted",          height: 28, weight: 5.5, hypoallergenic: "No",  dietaryRestrictions: "No restrictions",        adoptionStatus: "Available", bio: "Mango is a wild-looking Ocicat with zero wild instincts. He is outgoing, playful, and greets every visitor with unabashed enthusiasm." },
  { name: "Lulu",      breed: "Domestic Shorthair",  color: "Tortoiseshell",          height: 25, weight: 4,   hypoallergenic: "No",  dietaryRestrictions: "No restrictions",        adoptionStatus: "Available", bio: "Lulu is a tortoiseshell cat with a personality as multi-colored as her coat. She is feisty, sweet, and completely unique." },
  { name: "Biscotti",  breed: "Birman",               color: "Seal Point with White Gloves", height: 28, weight: 5, hypoallergenic: "No", dietaryRestrictions: "No restrictions",   adoptionStatus: "Available", bio: "Biscotti is a gentle Birman with silky fur and perfect white gloves. She is calm, affectionate, and wonderful with children and other cats." },
  { name: "Pixel",     breed: "Devon Rex",            color: "Gray",                   height: 26, weight: 3.5, hypoallergenic: "Yes", dietaryRestrictions: "High-calorie food",      adoptionStatus: "Available", bio: "Pixel is a curly-coated Devon Rex who resembles an elf. She is hypoallergenic, highly social, and attaches herself to people like velcro." },
  { name: "Sage",      breed: "Ragdoll",              color: "Lilac Bicolor",          height: 30, weight: 7,   hypoallergenic: "No",  dietaryRestrictions: "No restrictions",        adoptionStatus: "Available", bio: "Sage is a gentle Ragdoll who goes completely limp when picked up. She is quiet, loving, and the most stress-relieving cat you will ever meet." },
  { name: "Miso",      breed: "Japanese Bobtail",     color: "Calico",                 height: 25, weight: 3.5, hypoallergenic: "No",  dietaryRestrictions: "No restrictions",        adoptionStatus: "Available", bio: "Miso is a lucky Japanese Bobtail calico with a stubby pompom tail. She is energetic, chatty, and believed to bring good fortune." },
  { name: "Dusk",      breed: "Chartreux",            color: "Blue-Gray",              height: 27, weight: 5.5, hypoallergenic: "No",  dietaryRestrictions: "No restrictions",        adoptionStatus: "Available", bio: "Dusk is a quiet, sturdy Chartreux with a woolly blue coat and a permanent smile. He is observant and deeply devoted to his chosen person." },
  { name: "Spectre",   breed: "Sphynx",               color: "Hairless Gray",          height: 24, weight: 4,   hypoallergenic: "Yes", dietaryRestrictions: "High-calorie diet",      adoptionStatus: "Fostered",  bio: "Spectre is a bald, wrinkled Sphynx who radiates warmth — literally. She is sociable, mischievous, and loves burrowing under blankets." },
  { name: "Apricot",   breed: "Turkish Van",          color: "White and Orange",       height: 28, weight: 5,   hypoallergenic: "No",  dietaryRestrictions: "No restrictions",        adoptionStatus: "Available", bio: "Apricot is a playful Turkish Van known for his love of water. He will happily splash in the sink and is always game for a new adventure." },
  { name: "Timber",    breed: "Siberian",             color: "Brown Tabby",            height: 30, weight: 7,   hypoallergenic: "No",  dietaryRestrictions: "No restrictions",        adoptionStatus: "Available", bio: "Timber is a sturdy Siberian who originated from Russia's cold forests. He is robust, playful, and nearly hypoallergenic due to low Fel d 1 levels." },
  { name: "Cosmo",     breed: "Tonkinese",            color: "Mink Brown",             height: 26, weight: 4.5, hypoallergenic: "No",  dietaryRestrictions: "No restrictions",        adoptionStatus: "Available", bio: "Cosmo is an outgoing Tonkinese who bridges the gap between the playful Siamese and the gentle Burmese. He loves people unconditionally." },
  { name: "Marble",    breed: "Egyptian Mau",         color: "Silver Spotted",         height: 28, weight: 4.5, hypoallergenic: "No",  dietaryRestrictions: "No restrictions",        adoptionStatus: "Available", bio: "Marble is the fastest domestic cat on earth and she knows it. This Egyptian Mau is agile, loyal, and absolutely stunning to watch run." },
  { name: "Iris",      breed: "British Shorthair",    color: "Lilac",                  height: 27, weight: 5.5, hypoallergenic: "No",  dietaryRestrictions: "No restrictions",        adoptionStatus: "Available", bio: "Iris is a round, plush British Shorthair with a lilac coat that glows. She is independent, calm, and ideal for a laid-back household." },
  { name: "Midnight",  breed: "Bombay",               color: "Black",                  height: 24, weight: 4,   hypoallergenic: "No",  dietaryRestrictions: "No restrictions",        adoptionStatus: "Available", bio: "Midnight is an all-black Bombay with golden eyes that seem to glow in the dark. He is curious, affectionate, and a magical presence in any home." },
  { name: "Hazel",     breed: "Cornish Rex",          color: "Cinnamon",               height: 26, weight: 3,   hypoallergenic: "Yes", dietaryRestrictions: "High-calorie food",      adoptionStatus: "Available", bio: "Hazel is a curly-coated Cornish Rex with enormous ears and a playful spirit. She is hypoallergenic and absolutely addicted to human warmth." },
  { name: "Caramel",   breed: "Domestic Shorthair",  color: "Cream and Tan",          height: 25, weight: 4,   hypoallergenic: "No",  dietaryRestrictions: "No restrictions",        adoptionStatus: "Available", bio: "Caramel is a sweet, mellow domestic cat who melts into any home. She is the ideal first cat — low-maintenance, gentle, and endlessly loving." },
  { name: "Zorro",     breed: "Turkish Angora",       color: "Black and White",        height: 26, weight: 4,   hypoallergenic: "No",  dietaryRestrictions: "No restrictions",        adoptionStatus: "Available", bio: "Zorro wears a masked pattern on his face and lives up to his name with daring acrobatics. He is athletic, elegant, and extremely clever." },
];

const horsesMeta = [
  { name: "Eclipse",      breed: "Thoroughbred",        color: "Bay",                    height: 163, weight: 540, hypoallergenic: "No", dietaryRestrictions: "Performance feed with supplements",  adoptionStatus: "Available", bio: "Eclipse is a retired racehorse named after the legendary unbeaten champion. He is spirited and responsive and thrives under an experienced rider." },
  { name: "Cobalt",       breed: "Quarter Horse",        color: "Blue Roan",              height: 155, weight: 510, hypoallergenic: "No", dietaryRestrictions: "Hay and grain",                         adoptionStatus: "Available", bio: "Cobalt is a blue roan Quarter Horse with a striking coat and a steady disposition. He is trained in western riding and perfect for trail work." },
  { name: "Obsidian",     breed: "Friesian",             color: "Black",                  height: 165, weight: 600, hypoallergenic: "No", dietaryRestrictions: "Quality hay, limited grain",            adoptionStatus: "Available", bio: "Obsidian is a majestic black Friesian with a flowing mane that reaches his knees. He is a gentle giant beloved by all who meet him." },
  { name: "Sandstorm",    breed: "Arabian",              color: "Palomino",               height: 152, weight: 440, hypoallergenic: "No", dietaryRestrictions: "Fiber-rich forage, avoid lush pasture",adoptionStatus: "Fostered",  bio: "Sandstorm is a golden Arabian who moves like the wind. She is sensitive, elegant, and forms an extraordinary bond with a dedicated rider." },
  { name: "Glacier",      breed: "Lipizzaner",           color: "White",                  height: 160, weight: 520, hypoallergenic: "No", dietaryRestrictions: "Quality hay and muesli",               adoptionStatus: "Available", bio: "Glacier is a classical Lipizzaner trained in haute école movements. He is proud, intelligent, and a living work of art." },
  { name: "Thunder",      breed: "Clydesdale",           color: "Bay Roan",               height: 175, weight: 900, hypoallergenic: "No", dietaryRestrictions: "Large quantities of hay and grain",   adoptionStatus: "Available", bio: "Thunder is a magnificent Clydesdale with feathered hooves and the gentlest soul. He loves children and is incredibly calm for his size." },
  { name: "Zephyr",       breed: "Andalusian",           color: "Dapple Gray",            height: 160, weight: 520, hypoallergenic: "No", dietaryRestrictions: "Quality hay, vitamins",               adoptionStatus: "Available", bio: "Zephyr is a dapple-gray Andalusian with natural collection and presence. He is responsive, noble, and excels in dressage." },
  { name: "Chestnut",     breed: "Belgian Draft",        color: "Chestnut",               height: 175, weight: 950, hypoallergenic: "No", dietaryRestrictions: "Large hay quantities and grain",      adoptionStatus: "Available", bio: "Chestnut is a powerful Belgian Draft who once pulled heavy loads but now enjoys a peaceful life. He is kind, patient, and loves gentle hacks." },
  { name: "Ivory",        breed: "Connemara Pony",       color: "Gray",                   height: 145, weight: 380, hypoallergenic: "No", dietaryRestrictions: "Hay only, careful with grain",        adoptionStatus: "Fostered",  bio: "Ivory is a sturdy Connemara Pony with an Irish heart. She is sure-footed, intelligent, and a perfect first horse for a young rider." },
  { name: "Ember",        breed: "Haflinger",            color: "Chestnut with Flaxen Mane", height: 145, weight: 400, hypoallergenic: "No", dietaryRestrictions: "Hay, limited grain",          adoptionStatus: "Available", bio: "Ember glows with a warm chestnut coat and a flaxen mane that catches the light. She is kind, willing, and suitable for the whole family." },
  { name: "Fjord",        breed: "Norwegian Fjord",      color: "Dun with Dorsal Stripe", height: 148, weight: 440, hypoallergenic: "No", dietaryRestrictions: "Hay and access to salt lick",        adoptionStatus: "Available", bio: "Fjord is a Norwegian Fjord with the distinctive dun coloring and upright mane. He is robust, reliable, and suited for beginners and children." },
  { name: "Phantom",      breed: "Paint Horse",          color: "Overo Black and White",  height: 155, weight: 500, hypoallergenic: "No", dietaryRestrictions: "Mixed hay with vitamin supplement",  adoptionStatus: "Available", bio: "Phantom is a black-and-white overo Paint with a dramatic pattern. He is confident on trails and calm in the arena." },
  { name: "Sunrise",      breed: "Appaloosa",            color: "Blanket Spotted",        height: 152, weight: 480, hypoallergenic: "No", dietaryRestrictions: "Low-sugar diet",                     adoptionStatus: "Available", bio: "Sunrise has a stunning blanket pattern on her hindquarters. She is level-headed, trail-savvy, and a delight to ride at every pace." },
  { name: "Sable",        breed: "Morgan",               color: "Dark Brown",             height: 150, weight: 470, hypoallergenic: "No", dietaryRestrictions: "Hay and salt lick",                   adoptionStatus: "Available", bio: "Sable is a compact Morgan with tremendous heart and versatility. He excels in endurance, pleasure, and carriage work equally well." },
  { name: "Admiral",      breed: "Warmblood",            color: "Chestnut",               height: 168, weight: 580, hypoallergenic: "No", dietaryRestrictions: "Performance feed, joint care",       adoptionStatus: "Available", bio: "Admiral is a sport Warmblood bred for competition. He is scopey over fences, rideable, and ready for an ambitious amateur or professional." },
  { name: "Maverick",     breed: "Mustang",              color: "Buckskin",               height: 148, weight: 430, hypoallergenic: "No", dietaryRestrictions: "Hay, natural grazing when possible", adoptionStatus: "Fostered",  bio: "Maverick was gentled from the wild and now trusts humans completely. He is tough, intelligent, and has the stamina of a horse twice his size." },
  { name: "Midnight",     breed: "Friesian Cross",       color: "Black",                  height: 162, weight: 580, hypoallergenic: "No", dietaryRestrictions: "Quality hay, limited grain",          adoptionStatus: "Available", bio: "Midnight is a Friesian cross with all the drama and none of the maintenance. He is smooth gaited, willing, and utterly breathtaking to watch." },
  { name: "Sahara",       breed: "Akhal-Teke",           color: "Golden Dun",             height: 158, weight: 450, hypoallergenic: "No", dietaryRestrictions: "High-quality concentrate",            adoptionStatus: "Available", bio: "Sahara is an Akhal-Teke with a metallic golden coat that shimmers in sunlight. She is bred for endurance and forms a legendary bond with her rider." },
  { name: "Snowdrop",     breed: "Shetland Pony",        color: "Skewbald",               height: 100, weight: 200, hypoallergenic: "No", dietaryRestrictions: "Strict hay diet, no rich grass",     adoptionStatus: "Available", bio: "Snowdrop is a skewbald Shetland with a supersized personality. She is cheeky, lovable, and perfect for young children learning to ride." },
  { name: "Apollo",       breed: "Lusitano",             color: "Gray",                   height: 158, weight: 510, hypoallergenic: "No", dietaryRestrictions: "Quality hay and muesli",              adoptionStatus: "Available", bio: "Apollo is a Lusitano trained in classical horsemanship. He is athletic, willing, and carries a natural impulsion that makes him a joy to ride." },
  { name: "Nugget",       breed: "Miniature Horse",      color: "Palomino",               height: 90,  weight: 100, hypoallergenic: "No", dietaryRestrictions: "Hay only, no grain",                  adoptionStatus: "Available", bio: "Nugget is a tiny palomino Miniature Horse who thinks he belongs in the house. He is a certified therapy animal and spreads joy everywhere." },
  { name: "Pilgrim",      breed: "Tennessee Walking Horse", color: "Black",               height: 155, weight: 500, hypoallergenic: "No", dietaryRestrictions: "Hay and grain",                       adoptionStatus: "Available", bio: "Pilgrim has a silky-smooth running walk that feels like floating. He is calm, sure-footed, and a superb long-distance trail companion." },
  { name: "Perle",        breed: "Hanoverian",           color: "Chestnut",               height: 165, weight: 580, hypoallergenic: "No", dietaryRestrictions: "Performance feed, joint supplements",adoptionStatus: "Available", bio: "Perle is a quality Hanoverian mare with excellent bloodlines. She is elastic in movement, focused in work, and a pleasure to be around." },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getSortedImages(folder) {
  return fs
    .readdirSync(folder)
    .filter((f) => /\.(jpg|jpeg|png|webp|gif)$/i.test(f))
    .sort();
}

function uploadToCloudinary(filePath) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(filePath, { resource_type: "image" }, (err, result) => {
      if (err) reject(err);
      else resolve(result.secure_url);
    });
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function run() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log("Connected to MongoDB.");

  const categories = [
    { folder: path.join(IMAGES_ROOT, "כלבים"),  type: "Dog",   meta: dogsMeta  },
    { folder: path.join(IMAGES_ROOT, "חתולים"), type: "Cat",   meta: catsMeta  },
    { folder: path.join(IMAGES_ROOT, "סוסים"),  type: "Horse", meta: horsesMeta },
  ];

  let totalInserted = 0;

  for (const { folder, type, meta } of categories) {
    const files = getSortedImages(folder);
    console.log(`\n${type}: ${files.length} images found, ${meta.length} entries defined.`);

    const count = Math.min(files.length, meta.length);

    for (let i = 0; i < count; i++) {
      const filePath = path.join(folder, files[i]);
      const m = meta[i];

      process.stdout.write(`  [${i + 1}/${count}] Uploading ${files[i]} ... `);
      let imageUrl;
      try {
        imageUrl = await uploadToCloudinary(filePath);
        console.log("OK");
      } catch (err) {
        console.log(`FAILED: ${err.message}`);
        continue;
      }

      await Pets.create({
        type,
        breed: m.breed,
        name: m.name,
        adoptionStatus: m.adoptionStatus,
        height: m.height,
        weight: m.weight,
        color: m.color,
        bio: m.bio,
        hypoallergenic: m.hypoallergenic,
        dietaryRestrictions: m.dietaryRestrictions,
        imageUrl,
        adopt: [],
        foster: [],
        userId: "",
      });

      totalInserted++;
    }
  }

  console.log(`\nDone. ${totalInserted} new pets inserted.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Error:", err);
  mongoose.disconnect();
  process.exit(1);
});
