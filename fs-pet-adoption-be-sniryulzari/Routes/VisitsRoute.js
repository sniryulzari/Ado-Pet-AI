const express = require("express");
const router = express.Router();
const { createVisit, getMyVisits, cancelVisit, getAllVisits, updateVisitStatus } = require("../Controllers/visitsController");
const { Auth } = require("../Middleware/AuthMiddleWare");
const { isAdmin } = require("../Middleware/AdminMiddleWare");

router.post("/",                  Auth,          createVisit);
router.get("/my",                 Auth,          getMyVisits);
router.put("/:visitId/cancel",    Auth,          cancelVisit);
router.get("/all",                Auth, isAdmin, getAllVisits);
router.put("/:visitId/status",    Auth, isAdmin, updateVisitStatus);

module.exports = router;
