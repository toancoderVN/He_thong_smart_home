const db = require("../config/database");
const bcrypt = require("bcryptjs");

module.exports = {
    // Kiểm tra người dùng theo tên tài khoản
    checkUserByUsername: (username) => {
        const query = "SELECT * FROM users WHERE username = ?";
        return new Promise((resolve, reject) => {
            db.query(query, [username], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
    },

    // Thêm người dùng mới
    addUser: (username, hashedPassword, role) => {
        const query = "INSERT INTO users (username, password, role) VALUES (?, ?, ?)";
        return new Promise((resolve, reject) => {
            db.query(query, [username, hashedPassword, role], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    },

    // Lấy danh sách tất cả người dùng
    getAllUsers: () => {
        const query = "SELECT id, username, role FROM users";
        return new Promise((resolve, reject) => {
            db.query(query, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
    },

    // Xóa người dùng theo ID
    deleteUserById: (userId) => {
        const query = "DELETE FROM users WHERE id = ?";
        return new Promise((resolve, reject) => {
            db.query(query, [userId], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
    },
};
