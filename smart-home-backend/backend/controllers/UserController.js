const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/database");
const SECRET_KEY = "your_secret_key";

// Đăng ký người dùng
exports.register = (req, res) => {
  const { username, password, role } = req.body;

  if (!["admin", "user"].includes(role)) {
    return res.status(400).send("Vai trò không hợp lệ. Vai trò hợp lệ là 'admin' hoặc 'user'.");
  }

  const checkQuery = "SELECT * FROM users WHERE username = ?";
  db.query(checkQuery, [username], (err, results) => {
    if (err) return res.status(500).send("Lỗi hệ thống.");
    if (results.length > 0) return res.status(400).send("Tên tài khoản đã tồn tại.");

    const hashedPassword = bcrypt.hashSync(password, 8);
    const query = "INSERT INTO users (username, password, role) VALUES (?, ?, ?)";
    db.query(query, [username, hashedPassword, role], (err) => {
      if (err) return res.status(500).send("Lỗi khi đăng ký!");
      res.send("Đăng ký thành công!");
    });
  });
};

// Đăng nhập
exports.login = (req, res) => {
  const { username, password } = req.body;

  const query = "SELECT * FROM users WHERE username = ?";
  db.query(query, [username], (err, results) => {
    if (err) return res.status(500).send("Lỗi khi đăng nhập!");
    if (results.length === 0) return res.status(404).send("Tài khoản không tồn tại!");

    const user = results[0];
    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) return res.status(401).send("Mật khẩu không đúng!");

    const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: "1d" });
    res.send({ token });
  });
};

// Lấy danh sách người dùng (chỉ admin)
exports.getUsers = (req, res) => {
  const query = "SELECT id, username, role FROM users";
  db.query(query, (err, results) => {
    if (err) return res.status(500).send("Lỗi khi lấy danh sách người dùng.");
    res.send(results);
  });
};

// Xóa người dùng (chỉ admin)
exports.deleteUser = (req, res) => {
  const userId = req.params.userId;

  // Kiểm tra vai trò (chỉ admin mới được phép xóa)
  if (req.user.role !== "admin") {
    return res.status(403).send("Bạn không có quyền xóa người dùng.");
  }

  const deleteQuery = "DELETE FROM users WHERE id = ?";
  db.query(deleteQuery, [userId], (err, results) => {
    if (err) return res.status(500).send("Lỗi khi xóa người dùng.");
    if (results.affectedRows === 0) return res.status(404).send("Người dùng không tồn tại.");

    res.send("Người dùng đã được xóa thành công.");
  });
};

