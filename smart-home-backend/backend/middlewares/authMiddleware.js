const jwt = require("jsonwebtoken");
const SECRET_KEY= process.env.SECRET_KEY

exports.checkRole = (requiredRole) => {
  return (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ error: "Bạn cần đăng nhập!" });
    }

    const token = authHeader.split(" ")[1]; // Lấy token từ Bearer token
    if (!token) {
      return res.status(403).json({ error: "Token không hợp lệ!" });
    }

    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      if (decoded.role !== requiredRole) {
        return res.status(403).json({ error: "Bạn không có quyền truy cập!" });
      }
      req.user = decoded; // Gắn thông tin người dùng vào req
      next();
    } catch (err) {
      console.error("Lỗi xác thực:", err);
      return res.status(401).json({ error: "Token không hợp lệ!" });
    }
  };
};
