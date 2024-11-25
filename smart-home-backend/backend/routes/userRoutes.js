const express = require("express");
const { register, login, getUsers, deleteUser } = require("../controllers/UserController");
const { checkRole } = require("../middlewares/authMiddleware");
const router = express.Router();

// Đăng ký
router.post("/register", checkRole("admin"), register);

// Đăng nhập
router.post("/login", login);

// Lấy danh sách người dùng (chỉ admin)
router.get("/", checkRole("admin"), getUsers);

// Xóa người dùng (chỉ admin)
router.delete("/:userId", checkRole("admin"), deleteUser);

module.exports = router;
