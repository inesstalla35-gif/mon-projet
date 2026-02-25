const express =require("express");
const protect = require("../middleware/authMiddleware");
notificationController =require("../controllers/notificationcontroller")

router.get("/", protect, notificationController.getNotifications);
router.put("/:id/read",protect, notificationController.markAsRead);
