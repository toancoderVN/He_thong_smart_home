const db = require("../config/database");

// Tạo phòng mới
exports.createRoom = (req, res) => {
    const { name, userID } = req.body;

    if (!name || !userID) {
        return res.status(400).send("Tên phòng và userID là bắt buộc.");
    }

    const query = "INSERT INTO rooms (name, userID) VALUES (?, ?)";
    db.query(query, [name, userID], (err, result) => {
        if (err) {
            console.error("Lỗi khi tạo phòng:", err);
            return res.status(500).send("Lỗi hệ thống.");
        }
        res.send({ message: "Phòng đã được tạo thành công!", roomID: result.insertId });
    });
};

// Lấy danh sách phòng
exports.getRooms = (req, res) => {
    const userID = req.user.id; // Lấy ID của user từ token JWT.

    const query = "SELECT * FROM rooms WHERE userID = ?";
    db.query(query, [userID], (err, results) => {
        if (err) {
            console.error("Lỗi khi lấy danh sách phòng:", err);
            return res.status(500).send("Lỗi hệ thống.");
        }
        res.send(results);
    });
};
