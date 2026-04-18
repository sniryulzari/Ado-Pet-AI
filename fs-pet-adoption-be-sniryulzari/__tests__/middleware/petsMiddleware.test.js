const { filterQuery } = require("../../Middleware/PetsMiddleware");

describe("PetsMiddleware – filterQuery", () => {
  let req, res, next;

  beforeEach(() => {
    req = { query: {} };
    res = {};
    next = jest.fn();
  });

  it("calls next() when no query params are present", () => {
    filterQuery(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  // --- Empty string stripping ---
  it("strips empty-string query params so they don't become DB conditions", () => {
    req.query = { name: "", adoptionStatus: "Available", type: "" };
    filterQuery(req, res, next);
    expect(req.query).not.toHaveProperty("name");
    expect(req.query).not.toHaveProperty("type");
    expect(req.query.adoptionStatus).toBe("Available");
    expect(next).toHaveBeenCalledTimes(1);
  });

  // --- Name / regex ---
  it("converts name to a case-insensitive MongoDB $regex query", () => {
    req.query.name = "buddy";
    filterQuery(req, res, next);
    expect(req.query.name).toEqual({ $regex: "buddy", $options: "i" });
  });

  it("escapes regex metacharacters in name (ReDoS protection)", () => {
    req.query.name = "(a+)+$";
    filterQuery(req, res, next);
    expect(req.query.name.$regex).toBe("\\(a\\+\\)\\+\\$");
  });

  it("escapes dot and star characters", () => {
    req.query.name = "fluffy.*cat";
    filterQuery(req, res, next);
    expect(req.query.name.$regex).toBe("fluffy\\.\\*cat");
  });

  it("escapes curly braces, pipes, brackets, and backslash", () => {
    req.query.name = "a{2}|b[c]\\d";
    filterQuery(req, res, next);
    // Each special char should be escaped
    expect(req.query.name.$regex).toBe("a\\{2\\}\\|b\\[c\\]\\\\d");
  });

  it("preserves plain alphanumeric names unchanged", () => {
    req.query.name = "Max123";
    filterQuery(req, res, next);
    expect(req.query.name.$regex).toBe("Max123");
  });

  // --- adoptionStatus ---
  it("preserves adoptionStatus as a plain string", () => {
    req.query.adoptionStatus = "Fostered";
    filterQuery(req, res, next);
    expect(req.query.adoptionStatus).toBe("Fostered");
  });

  // --- Height range ---
  it("converts minHeight/maxHeight to a $gt/$lte range query", () => {
    req.query = { minHeight: "10", maxHeight: "50" };
    filterQuery(req, res, next);
    expect(req.query.height).toEqual({ $gt: 10, $lte: 50 });
    expect(req.query).not.toHaveProperty("minHeight");
    expect(req.query).not.toHaveProperty("maxHeight");
  });

  it("does NOT create a height range when only minHeight is given", () => {
    req.query = { minHeight: "10" };
    filterQuery(req, res, next);
    expect(req.query).not.toHaveProperty("height");
  });

  it("does NOT create a height range when only maxHeight is given", () => {
    req.query = { maxHeight: "80" };
    filterQuery(req, res, next);
    expect(req.query).not.toHaveProperty("height");
  });

  // --- Weight range ---
  it("converts minWeight/maxWeight to a $gt/$lte range query", () => {
    req.query = { minWeight: "5", maxWeight: "30" };
    filterQuery(req, res, next);
    expect(req.query.weight).toEqual({ $gt: 5, $lte: 30 });
    expect(req.query).not.toHaveProperty("minWeight");
    expect(req.query).not.toHaveProperty("maxWeight");
  });

  // --- Combined filters ---
  it("handles all filters simultaneously", () => {
    req.query = {
      name: "Max",
      adoptionStatus: "Available",
      minHeight: "20",
      maxHeight: "80",
      minWeight: "10",
      maxWeight: "40",
    };
    filterQuery(req, res, next);
    expect(req.query.name).toEqual({ $regex: "Max", $options: "i" });
    expect(req.query.adoptionStatus).toBe("Available");
    expect(req.query.height).toEqual({ $gt: 20, $lte: 80 });
    expect(req.query.weight).toEqual({ $gt: 10, $lte: 40 });
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("handles numeric string values correctly for range boundaries", () => {
    req.query = { minHeight: "0", maxHeight: "200" };
    filterQuery(req, res, next);
    expect(req.query.height).toEqual({ $gt: 0, $lte: 200 });
  });
});
