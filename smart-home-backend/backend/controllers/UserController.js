const userService = require("../services/UserService");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY;

// Đăng ký người dùng
exports.register = async (req, res) => {
    try {
        const { username, password, role } = req.body;

        if (!["admin", "user"].includes(role)) {
            return res.status(400).send("Vai trò không hợp lệ. Vai trò hợp lệ là 'admin' hoặc 'user'.");
        }

        const users = await userService.checkUserByUsername(username);
        if (users.length > 0) {
            return res.status(400).send("Tên tài khoản đã tồn tại.");
        }

        const hashedPassword = bcrypt.hashSync(password, 8);
        await userService.addUser(username, hashedPassword, role);

        res.send("Đăng ký thành công!");
    } catch (error) {
        console.error("Lỗi khi đăng ký:", error.message);
        res.status(500).send("Lỗi hệ thống.");
    }
};

// Đăng nhập
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const users = await userService.checkUserByUsername(username);
        if (users.length === 0) {
            return res.status(404).send("Tài khoản không tồn tại!");
        }

        const user = users[0];
        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) {
            return res.status(401).send("Mật khẩu không đúng!");
        }

        const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: "1d" });
        res.send({ token });
    } catch (error) {
        console.error("Lỗi khi đăng nhập:", error.message);
        res.status(500).send("Lỗi hệ thống.");
    }
};

// Lấy danh sách người dùng
exports.getUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.send(users);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách người dùng:", error.message);
        res.status(500).send("Lỗi hệ thống.");
    }
};

// Xóa người dùng
exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Kiểm tra vai trò (chỉ admin mới được phép xóa)
        if (req.user.role !== "admin") {
            return res.status(403).send("Bạn không có quyền xóa người dùng.");
        }

        const results = await userService.deleteUserById(userId);
        if (results.affectedRows === 0) {
            return res.status(404).send("Người dùng không tồn tại.");
        }

        res.send("Người dùng đã được xóa thành công.");
    } catch (error) {
        console.error("Lỗi khi xóa người dùng:", error.message);
        res.status(500).send("Lỗi hệ thống.");
    }
};
