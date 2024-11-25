const db = require("../config/database");

// Hàm tạo phòng mới
exports.createRoom = (name, userID) => {
    const query = "INSERT INTO rooms (name, userID) VALUES (?, ?)";
    return new Promise((resolve, reject) => {
        db.query(query, [name, userID], (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result.insertId); // Trả về ID của phòng vừa tạo
        });
    });
};

// Hàm lấy danh sách phòng
exports.getRooms = (userID) => {
    const query = "SELECT * FROM rooms WHERE userID = ?";
    return new Promise((resolve, reject) => {
        db.query(query, [userID], (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results); // Trả về danh sách các phòng
        });
    });
};

// Hàm lấy danh sách thiết bị trong phòng
exports.getDevicesByRoom = (roomID) => {
    const query = "SELECT * FROM devices WHERE roomID = ?";
    return new Promise((resolve, reject) => {
        db.query(query, [roomID], (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results); // Trả về danh sách thiết bị
        });
    });
};
