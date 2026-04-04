const express = require("express");
const router = express.Router();
const { addVoter, getVoters, getVotersByConstituency_, getVotersByBooth_ } = require("../controllers/voterController");
const { validateVoter } = require("../middleware/validateMiddleware");

router.post("/", validateVoter, addVoter);
router.get("/", getVoters);
router.get("/constituency/:constituency_id", getVotersByConstituency_);
router.get("/booth/:booth_number", getVotersByBooth_);

module.exports = router;