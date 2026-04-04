const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getAllUsers_ } = require("../controllers/userController");
const { verifyToken } = require("../middleware/authMiddleware");
const { validateUser, validateLogin } = require("../middleware/validateMiddleware");

router.post("/register", validateUser, registerUser);
router.post("/login", validateLogin, loginUser);
router.get("/", verifyToken, getAllUsers_);

module.exports = router;