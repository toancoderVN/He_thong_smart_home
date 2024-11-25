const RoomService = require("../services/RoomService");

// API tạo phòng mới
exports.createRoom = async (req, res) => {
    try {
        const { name, userID } = req.body;

        if (!name || !userID) {
            return res.status(400).json({ error: "Tên phòng và userID là bắt buộc." });
        }

        const roomID = await RoomService.createRoom(name, userID);
        res.status(201).json({
            message: "Phòng đã được tạo thành công!",
            roomID,
        });
    } catch (err) {
        console.error("Lỗi khi tạo phòng:", err);
        res.status(500).json({ error: "Lỗi hệ thống." });
    }
};

// API lấy danh sách phòng
exports.getRooms = async (req, res) => {
    try {
        const userID = req.user.id; // Lấy ID của user từ token JWT

        const rooms = await RoomService.getRooms(userID);
        res.status(200).json(rooms);
    } catch (err) {
        console.error("Lỗi khi lấy danh sách phòng:", err);
        res.status(500).json({ error: "Lỗi hệ thống." });
    }
};

// API lấy danh sách thiết bị trong phòng
exports.getDevicesByRoom = async (req, res) => {
    try {
        const roomID = req.params.roomID;

        const devices = await RoomService.getDevicesByRoom(roomID);
        res.status(200).json(devices);
    } catch (err) {
        console.error("Lỗi khi lấy danh sách thiết bị:", err);
        res.status(500).json({ error: "Lỗi hệ thống." });
    }
};
