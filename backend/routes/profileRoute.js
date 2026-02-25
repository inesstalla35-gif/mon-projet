const express = require("express");
const router  = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  getProfile,
  createOrUpdateProfile,
  deleteProfile,
} = require("../controllers/profileController");

// app.js monte sur "/api/profile" donc ici on utilise "/"
router.get   ("/", protect, getProfile);
router.post  ("/", protect, createOrUpdateProfile);
router.delete("/", protect, deleteProfile);

module.exports = router;