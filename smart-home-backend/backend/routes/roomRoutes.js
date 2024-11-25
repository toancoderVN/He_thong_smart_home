const express = require("express");
const { createRoom, getRooms, getDevicesByRoom } = require("../controllers/RoomController");
const { checkRole } = require("../middlewares/authMiddleware");
const router = express.Router();

// Route tạo phòng mới
router.post("/add", checkRole("user"), createRoom);

// Route lấy danh sách phòng
router.get("/", checkRole("user"), getRooms);

// Route lấy danh sách thiết bị trong phòng
router.get("/:roomID/devices", checkRole("user"), getDevicesByRoom);

module.exports = router;
