/**
 * Integration tests for /pets routes.
 *
 * Exercises the full middleware chain via supertest — filterQuery, Auth,
 * and controller — with DB models and external services mocked out.
 */

// ─── Mock all external dependencies loaded transitively by app.js ────────────

jest.mock("../../Models/usersModel");
jest.mock("../../Models/petsModel");
jest.mock("../../Models/adminModel");
jest.mock("../../Models/newsletterModel");
jest.mock("../../Models/appOperationsModel", () => ({
  petOfTheWeekModel: jest.fn(),
}));

jest.mock("../../utils/emailService", () => ({
  sendPasswordResetEmail:        jest.fn().mockResolvedValue(undefined),
  sendAdoptionConfirmationEmail: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("cloudinary", () => ({
  v2: {
    config:   jest.fn(),
    uploader: { upload: jest.fn() },
  },
}));

jest.mock("sib-api-v3-sdk", () => ({
  ApiClient:              { instance: { authentications: { "api-key": {} } } },
  TransactionalEmailsApi: jest.fn(() => ({ sendTransacEmail: jest.fn().mockResolvedValue({}) })),
  SendSmtpEmail:          jest.fn(() => ({})),
}));

jest.mock("../../Schemas/userSchemas", () => ({ findById: jest.fn() }));
jest.mock("../../Schemas/petsSchemas", () => ({ findById: jest.fn() }));

// ─── Imports ─────────────────────────────────────────────────────────────────

const request   = require("supertest");
const jwt       = require("jsonwebtoken");
const petsModel = require("../../Models/petsModel");
const app       = require("../../app");

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SECRET = process.env.TOKEN_SECRET;

function makeToken(id = "user123") {
  return jwt.sign({ id }, SECRET, { expiresIn: "1h" });
}

const SAMPLE_PET = {
  _id:            "pet1",
  name:           "Buddy",
  type:           "Dog",
  breed:          "Labrador",
  adoptionStatus: "Available",
  height:         60,
  weight:         25,
  color:          "Yellow",
  hypoallergenic: false,
  dietaryRestrictions: "None",
  bio:            "Friendly dog.",
  imageUrl:       "https://example.com/buddy.jpg",
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("Pets Routes – Integration", () => {
  beforeEach(() => jest.resetAllMocks());

  // ── GET /pets/search ──────────────────────────────────────────────────────

  describe("GET /pets/search", () => {
    it("returns an array of pets with 200", async () => {
      petsModel.searchPetsModel.mockResolvedValue([SAMPLE_PET]);
      const res = await request(app).get("/pets/search");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0]).toMatchObject({ name: "Buddy" });
    });

    it("passes name query param to the model (via filterQuery middleware)", async () => {
      petsModel.searchPetsModel.mockResolvedValue([SAMPLE_PET]);
      await request(app).get("/pets/search?name=Buddy");
      // filterQuery builds a $regex query; the model receives the transformed query
      expect(petsModel.searchPetsModel).toHaveBeenCalledTimes(1);
    });

    it("returns an empty array when no pets match", async () => {
      petsModel.searchPetsModel.mockResolvedValue([]);
      const res = await request(app).get("/pets/search");
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it("returns 500 when the model throws", async () => {
      petsModel.searchPetsModel.mockRejectedValue(new Error("DB error"));
      const res = await request(app).get("/pets/search");
      expect(res.status).toBe(500);
    });
  });

  // ── GET /pets/:petId ──────────────────────────────────────────────────────

  describe("GET /pets/:petId", () => {
    it("returns the pet object with 200", async () => {
      petsModel.getPetByIdModel.mockResolvedValue(SAMPLE_PET);
      const res = await request(app).get("/pets/pet1");
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ name: "Buddy", breed: "Labrador" });
    });

    it("returns 500 when the model throws", async () => {
      petsModel.getPetByIdModel.mockRejectedValue(new Error("Not found"));
      const res = await request(app).get("/pets/nonexistent");
      expect(res.status).toBe(500);
    });
  });

  // ── Auth middleware enforcement on mutating routes ────────────────────────

  describe("Auth middleware enforcement", () => {
    it("PUT /pets/adopt returns 401 without a cookie", async () => {
      const res = await request(app).put("/pets/adopt").send({ petId: "pet1" });
      expect(res.status).toBe(401);
      expect(res.text).toBe("Token Required");
    });

    it("PUT /pets/foster returns 401 without a cookie", async () => {
      const res = await request(app).put("/pets/foster").send({ petId: "pet1" });
      expect(res.status).toBe(401);
    });

    it("PUT /pets/returnPet returns 401 without a cookie", async () => {
      const res = await request(app).put("/pets/returnPet").send({ petId: "pet1" });
      expect(res.status).toBe(401);
    });

    it("PUT /pets/adopt returns 200 with a valid token", async () => {
      petsModel.adoptPetStatusModel.mockResolvedValue(undefined);
      const token = makeToken("user123");
      const res = await request(app)
        .put("/pets/adopt")
        .set("Cookie", `token=${token}`)
        .send({ petId: "pet1" });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ok: true });
    });

    it("PUT /pets/foster returns 200 with a valid token", async () => {
      petsModel.fosterPetStatusModel.mockResolvedValue(undefined);
      const token = makeToken("user123");
      const res = await request(app)
        .put("/pets/foster")
        .set("Cookie", `token=${token}`)
        .send({ petId: "pet1" });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ok: true });
    });

    it("PUT /pets/returnPet returns 200 with a valid token", async () => {
      petsModel.returnPetModel.mockResolvedValue(undefined);
      const token = makeToken("user123");
      const res = await request(app)
        .put("/pets/returnPet")
        .set("Cookie", `token=${token}`)
        .send({ petId: "pet1" });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ok: true });
    });
  });

  // ── GET /pets/mySavedPets/:petId ──────────────────────────────────────────

  describe("GET /pets/mySavedPets/:petId", () => {
    it("returns pet info", async () => {
      petsModel.getPetInfoModel.mockResolvedValue(SAMPLE_PET);
      const res = await request(app).get("/pets/mySavedPets/pet1");
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ name: "Buddy" });
    });
  });
});
