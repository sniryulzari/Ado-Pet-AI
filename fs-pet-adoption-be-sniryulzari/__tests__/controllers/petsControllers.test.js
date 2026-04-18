jest.mock("../../Models/petsModel");

const petsModel = require("../../Models/petsModel");
const {
  searchPets,
  getPetById,
  adoptPetStatus,
  fosterPetStatus,
  returnPet,
  getMySavedPet,
  getMyAdoptedPet,
  getMyFosteredPet,
} = require("../../Controllers/petsControllers");

function makeRes() {
  return {
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
  };
}

describe("petsControllers", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {}, query: {} };
    res = makeRes();
    jest.clearAllMocks();
  });

  // ─── searchPets ───────────────────────────────────────────────────────────

  describe("searchPets", () => {
    it("returns the list of matching pets", async () => {
      const mockPets = [{ name: "Buddy" }, { name: "Luna" }];
      petsModel.searchPetsModel.mockResolvedValue(mockPets);
      await searchPets(req, res);
      expect(petsModel.searchPetsModel).toHaveBeenCalledWith(req.query);
      expect(res.send).toHaveBeenCalledWith(mockPets);
    });

    it("returns an empty array when no pets match", async () => {
      petsModel.searchPetsModel.mockResolvedValue([]);
      await searchPets(req, res);
      expect(res.send).toHaveBeenCalledWith([]);
    });

    it("returns 500 on model error", async () => {
      petsModel.searchPetsModel.mockRejectedValue(new Error("DB error"));
      await searchPets(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Server error");
    });
  });

  // ─── getPetById ───────────────────────────────────────────────────────────

  describe("getPetById", () => {
    it("returns the pet document for a given ID", async () => {
      const mockPet = { _id: "pet123", name: "Buddy", type: "Dog" };
      petsModel.getPetByIdModel.mockResolvedValue(mockPet);
      req.params.petId = "pet123";
      await getPetById(req, res);
      expect(petsModel.getPetByIdModel).toHaveBeenCalledWith("pet123");
      expect(res.send).toHaveBeenCalledWith(mockPet);
    });

    it("returns 500 on model error", async () => {
      petsModel.getPetByIdModel.mockRejectedValue(new Error("DB error"));
      req.params.petId = "invalid";
      await getPetById(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─── adoptPetStatus ───────────────────────────────────────────────────────

  describe("adoptPetStatus", () => {
    it("calls adoptPetStatusModel with correct args and returns { ok: true }", async () => {
      petsModel.adoptPetStatusModel.mockResolvedValue(undefined);
      req.body = { userId: "user123", petId: "pet123" };
      await adoptPetStatus(req, res);
      expect(petsModel.adoptPetStatusModel).toHaveBeenCalledWith(
        "user123",
        "pet123"
      );
      expect(res.send).toHaveBeenCalledWith({ ok: true });
    });

    it("returns 500 on model error", async () => {
      petsModel.adoptPetStatusModel.mockRejectedValue(new Error("DB error"));
      req.body = { userId: "user123", petId: "pet123" };
      await adoptPetStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Server error");
    });
  });

  // ─── fosterPetStatus ──────────────────────────────────────────────────────

  describe("fosterPetStatus", () => {
    it("calls fosterPetStatusModel with correct args and returns { ok: true }", async () => {
      petsModel.fosterPetStatusModel.mockResolvedValue(undefined);
      req.body = { userId: "user123", petId: "pet456" };
      await fosterPetStatus(req, res);
      expect(petsModel.fosterPetStatusModel).toHaveBeenCalledWith(
        "user123",
        "pet456"
      );
      expect(res.send).toHaveBeenCalledWith({ ok: true });
    });

    it("returns 500 on model error", async () => {
      petsModel.fosterPetStatusModel.mockRejectedValue(new Error("DB error"));
      req.body = { userId: "u", petId: "p" };
      await fosterPetStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─── returnPet ────────────────────────────────────────────────────────────

  describe("returnPet", () => {
    it("calls returnPetModel with correct args and returns { ok: true }", async () => {
      petsModel.returnPetModel.mockResolvedValue(undefined);
      req.body = { userId: "user123", petId: "pet123" };
      await returnPet(req, res);
      expect(petsModel.returnPetModel).toHaveBeenCalledWith(
        "user123",
        "pet123"
      );
      expect(res.send).toHaveBeenCalledWith({ ok: true });
    });

    it("returns 500 on model error", async () => {
      petsModel.returnPetModel.mockRejectedValue(new Error("DB error"));
      req.body = { userId: "u", petId: "p" };
      await returnPet(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─── getMySavedPet / getMyAdoptedPet / getMyFosteredPet ──────────────────

  describe("getMySavedPet", () => {
    it("returns the pet info document by petId", async () => {
      const petInfo = { _id: "pet123", name: "Buddy" };
      petsModel.getPetInfoModel.mockResolvedValue(petInfo);
      req.params.petId = "pet123";
      await getMySavedPet(req, res);
      expect(petsModel.getPetInfoModel).toHaveBeenCalledWith("pet123");
      expect(res.send).toHaveBeenCalledWith(petInfo);
    });

    it("returns 500 on model error", async () => {
      petsModel.getPetInfoModel.mockRejectedValue(new Error("DB error"));
      req.params.petId = "bad";
      await getMySavedPet(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getMyAdoptedPet", () => {
    it("returns the pet info document by petId", async () => {
      const petInfo = { _id: "pet999", name: "Luna" };
      petsModel.getPetInfoModel.mockResolvedValue(petInfo);
      req.params.petId = "pet999";
      await getMyAdoptedPet(req, res);
      expect(res.send).toHaveBeenCalledWith(petInfo);
    });
  });

  describe("getMyFosteredPet", () => {
    it("returns the pet info document by petId", async () => {
      const petInfo = { _id: "pet777", name: "Max" };
      petsModel.getPetInfoModel.mockResolvedValue(petInfo);
      req.params.petId = "pet777";
      await getMyFosteredPet(req, res);
      expect(res.send).toHaveBeenCalledWith(petInfo);
    });
  });
});
