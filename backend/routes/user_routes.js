// routes/authRoutes.js
const express = require("express");
const { register, login, current } = require("../controllers/user_controller");
const validatetoken = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login",login);
router.get("/current",validatetoken,current);

module.exports = router;
