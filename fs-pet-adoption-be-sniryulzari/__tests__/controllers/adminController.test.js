jest.mock("../../Models/adminModel");

const adminModel = require("../../Models/adminModel");
const {
  getAllPets,
  addPet,
  getPetById,
  getAllUsers,
  deletePet,
  editPet,
  getStats,
  getNewsletterSubscribers,
  deleteNewsletterSubscriber,
} = require("../../Controllers/AdminController");

function makeRes() {
  return {
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
  };
}

describe("AdminController", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = makeRes();
    jest.clearAllMocks();
  });

  // ─── getAllPets ────────────────────────────────────────────────────────────

  describe("getAllPets", () => {
    it("returns all pets from the model", async () => {
      const mockPets = [{ name: "Buddy" }, { name: "Luna" }];
      adminModel.getAllPetsModel.mockResolvedValue(mockPets);
      await getAllPets(req, res);
      expect(res.send).toHaveBeenCalledWith(mockPets);
    });

    it("returns 500 on model error", async () => {
      adminModel.getAllPetsModel.mockRejectedValue(new Error("DB error"));
      await getAllPets(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Server error");
    });
  });

  // ─── addPet ───────────────────────────────────────────────────────────────

  describe("addPet", () => {
    const validBody = {
      type: "Dog",
      breed: "Labrador",
      name: "Buddy",
      adoptionStatus: "Available",
      height: 50,
      weight: 20,
      color: "Brown",
      bio: "Friendly dog",
      hypoallergenic: "false",
      dietaryRestrictions: "None",
      imageUrl: "https://cloudinary.com/buddy.jpg",
    };

    it("returns 400 when imageUrl is missing", async () => {
      req.body = { ...validBody, imageUrl: undefined };
      await addPet(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith("Pet image is required");
    });

    it("returns 201 with the created pet on success", async () => {
      const createdPet = { _id: "pet123", ...validBody };
      adminModel.addPetModel.mockResolvedValue(createdPet);
      req.body = validBody;
      await addPet(req, res);
      expect(adminModel.addPetModel).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Buddy", imageUrl: validBody.imageUrl })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith(createdPet);
    });

    it("returns 500 on model error", async () => {
      adminModel.addPetModel.mockRejectedValue(new Error("DB error"));
      req.body = validBody;
      await addPet(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─── getPetById ───────────────────────────────────────────────────────────

  describe("getPetById", () => {
    it("returns the pet document by ID", async () => {
      const pet = { _id: "pet123", name: "Buddy" };
      adminModel.getPetByIdModel.mockResolvedValue(pet);
      req.params.petId = "pet123";
      await getPetById(req, res);
      expect(adminModel.getPetByIdModel).toHaveBeenCalledWith("pet123");
      expect(res.send).toHaveBeenCalledWith(pet);
    });

    it("returns 500 on model error", async () => {
      adminModel.getPetByIdModel.mockRejectedValue(new Error("DB error"));
      req.params.petId = "bad";
      await getPetById(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─── getAllUsers ───────────────────────────────────────────────────────────

  describe("getAllUsers", () => {
    it("returns all users from the model", async () => {
      const users = [{ email: "a@b.com" }, { email: "c@d.com" }];
      adminModel.getAllUsersModel.mockResolvedValue(users);
      await getAllUsers(req, res);
      expect(res.send).toHaveBeenCalledWith(users);
    });

    it("returns 500 on model error", async () => {
      adminModel.getAllUsersModel.mockRejectedValue(new Error("DB error"));
      await getAllUsers(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─── deletePet ────────────────────────────────────────────────────────────

  describe("deletePet", () => {
    it("calls deletePetModel with the petId and returns { ok: true }", async () => {
      adminModel.deletePetModel.mockResolvedValue(undefined);
      req.params.petId = "pet123";
      await deletePet(req, res);
      expect(adminModel.deletePetModel).toHaveBeenCalledWith("pet123");
      expect(res.send).toHaveBeenCalledWith({ ok: true });
    });

    it("returns 500 on model error", async () => {
      adminModel.deletePetModel.mockRejectedValue(new Error("DB error"));
      req.params.petId = "pet123";
      await deletePet(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─── editPet ──────────────────────────────────────────────────────────────

  describe("editPet", () => {
    it("calls editPetModel with whitelisted fields and returns { ok: true }", async () => {
      adminModel.editPetModel.mockResolvedValue(undefined);
      req.body = {
        _id: "pet123",
        name: "Updated Buddy",
        type: "Dog",
        breed: "Lab",
        adoptionStatus: "Available",
        height: 55,
        weight: 22,
        color: "Black",
        bio: "Updated bio",
        hypoallergenic: "true",
        dietaryRestrictions: "None",
        imageUrl: "https://cloudinary.com/updated.jpg",
        isAdmin: true, // should be ignored — only pet fields whitelisted
      };
      await editPet(req, res);
      expect(adminModel.editPetModel).toHaveBeenCalledWith(
        expect.not.objectContaining({ isAdmin: true }),
        "pet123"
      );
      expect(res.send).toHaveBeenCalledWith({ ok: true });
    });

    it("returns 500 on model error", async () => {
      adminModel.editPetModel.mockRejectedValue(new Error("DB error"));
      req.body = { _id: "pet123", name: "Updated" };
      await editPet(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─── getStats ─────────────────────────────────────────────────────────────

  describe("getStats", () => {
    it("returns stats from the model", async () => {
      const stats = { totalPets: 10, adopted: 3, fostered: 2, available: 5 };
      adminModel.getStatsModel.mockResolvedValue(stats);
      await getStats(req, res);
      expect(res.send).toHaveBeenCalledWith(stats);
    });

    it("returns 500 on model error", async () => {
      adminModel.getStatsModel.mockRejectedValue(new Error("DB error"));
      await getStats(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─── getNewsletterSubscribers ─────────────────────────────────────────────

  describe("getNewsletterSubscribers", () => {
    it("returns count and subscribers array", async () => {
      const subs = [{ email: "a@b.com" }, { email: "c@d.com" }];
      adminModel.getNewsletterSubscribersModel.mockResolvedValue(subs);
      await getNewsletterSubscribers(req, res);
      expect(res.send).toHaveBeenCalledWith({ count: 2, subscribers: subs });
    });

    it("returns count:0 and empty array when no subscribers", async () => {
      adminModel.getNewsletterSubscribersModel.mockResolvedValue([]);
      await getNewsletterSubscribers(req, res);
      expect(res.send).toHaveBeenCalledWith({ count: 0, subscribers: [] });
    });

    it("returns 500 on model error", async () => {
      adminModel.getNewsletterSubscribersModel.mockRejectedValue(
        new Error("DB error")
      );
      await getNewsletterSubscribers(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─── deleteNewsletterSubscriber ───────────────────────────────────────────

  describe("deleteNewsletterSubscriber", () => {
    it("decodes the email URL param and returns { ok: true }", async () => {
      adminModel.deleteNewsletterSubscriberModel.mockResolvedValue(undefined);
      req.params.email = encodeURIComponent("test@example.com");
      await deleteNewsletterSubscriber(req, res);
      expect(adminModel.deleteNewsletterSubscriberModel).toHaveBeenCalledWith(
        "test@example.com"
      );
      expect(res.send).toHaveBeenCalledWith({ ok: true });
    });

    it("handles email with special characters after decoding", async () => {
      adminModel.deleteNewsletterSubscriberModel.mockResolvedValue(undefined);
      req.params.email = encodeURIComponent("user+tag@domain.co.il");
      await deleteNewsletterSubscriber(req, res);
      expect(adminModel.deleteNewsletterSubscriberModel).toHaveBeenCalledWith(
        "user+tag@domain.co.il"
      );
    });

    it("returns 500 on model error", async () => {
      adminModel.deleteNewsletterSubscriberModel.mockRejectedValue(
        new Error("DB error")
      );
      req.params.email = encodeURIComponent("x@y.com");
      await deleteNewsletterSubscriber(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
