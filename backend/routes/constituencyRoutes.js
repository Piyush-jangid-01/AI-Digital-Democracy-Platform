const express = require("express");
const router = express.Router();
const { addConstituency, getConstituencies } = require("../controllers/constituencyController");

router.post("/", addConstituency);
router.get("/", getConstituencies);

module.exports = router;