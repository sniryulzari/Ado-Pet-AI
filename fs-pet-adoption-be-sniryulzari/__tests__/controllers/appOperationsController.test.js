/**
 * Unit tests for AppOperationsController.
 *
 * getPetOfTheWeek is the only function — it delegates to petOfTheWeekModel,
 * returns 404 when the result is empty/null, and 500 on a DB error.
 */

jest.mock("../../Models/appOperationsModel", () => ({
  petOfTheWeekModel: jest.fn(),
}));

const { petOfTheWeekModel } = require("../../Models/appOperationsModel");
const { getPetOfTheWeek }   = require("../../Controllers/AppOperationsController");

// Minimal Express-style req/res/next stubs
function makeRes() {
  const res = {
    status: jest.fn().mockReturnThis(),
    send:   jest.fn().mockReturnThis(),
  };
  return res;
}

describe("AppOperationsController – getPetOfTheWeek", () => {
  beforeEach(() => jest.resetAllMocks());

  it("responds with the pet-of-the-week data on success", async () => {
    const pet = { _id: "pet1", name: "Buddy", imageUrl: "https://example.com/buddy.jpg" };
    petOfTheWeekModel.mockResolvedValue(pet);
    const res = makeRes();
    await getPetOfTheWeek({}, res);
    expect(res.send).toHaveBeenCalledWith(pet);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("returns 404 when petOfTheWeekModel resolves to null", async () => {
    petOfTheWeekModel.mockResolvedValue(null);
    const res = makeRes();
    await getPetOfTheWeek({}, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({ message: "No pets available yet." });
  });

  it("returns 404 when petOfTheWeekModel resolves to an empty array", async () => {
    petOfTheWeekModel.mockResolvedValue([]);
    const res = makeRes();
    await getPetOfTheWeek({}, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({ message: "No pets available yet." });
  });

  it("returns 500 when petOfTheWeekModel throws", async () => {
    petOfTheWeekModel.mockRejectedValue(new Error("DB failure"));
    const res = makeRes();
    await getPetOfTheWeek({}, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ message: "Failed to retrieve pet of the week." });
  });
});
