// Escapes special regex characters in user input to prevent ReDoS attacks.
// Without this, a crafted name like `(a+)+$` could cause exponential backtracking
// in MongoDB's regex engine, hanging the DB thread on a single search request.
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function filterQuery(req, _res, next) {
  const { name, adoptionStatus, minHeight, maxHeight, minWeight, maxWeight } =
    req.query;

  // Strip empty strings so they don't become MongoDB query conditions
  for (const key in req.query) {
    if (req.query[key] === "") {
      delete req.query[key];
    }
  }

  if (name) {
    req.query.name = { $regex: escapeRegex(name), $options: "i" };
  }

  if (adoptionStatus) {
    req.query.adoptionStatus = adoptionStatus;
  }

  if (minHeight && maxHeight) {
    req.query.height = { $gt: Number(minHeight), $lte: Number(maxHeight) };
    delete req.query.minHeight;
    delete req.query.maxHeight;
  }

  if (minWeight && maxWeight) {
    req.query.weight = { $gt: Number(minWeight), $lte: Number(maxWeight) };
    delete req.query.minWeight;
    delete req.query.maxWeight;
  }

  next();
}

module.exports = { filterQuery };
