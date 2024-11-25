const express = require("express");
const { createRoom, getRooms } = require("../controllers/RoomController");
const { checkRole } = require("../middlewares/authMiddleware");
const db = require("../config/database");
const router = express.Router();

// Route tạo phòng mới
router.post("/add", checkRole("user"), createRoom);

// Route lấy danh sách phòng
router.get("/", checkRole("user"), getRooms);

router.get("/:roomID/devices", checkRole("user"), (req, res) => {
    const roomID = req.params.roomID;
  
    const query = "SELECT * FROM devices WHERE roomID = ?";
    db.query(query, [roomID], (err, results) => {
      if (err) {
        console.error("Lỗi khi lấy danh sách thiết bị:", err);
        return res.status(500).send("Lỗi hệ thống.");
      }
      res.send(results);
    });
  });

module.exports = router;
