const db = require("../config/database");
const axios = require("axios"); // Import thư viện axios

// Điều khiển thiết bị
exports.controlDevice = (req, res) => {
    console.log("Yêu cầu điều khiển:", req.body); // Log yêu cầu frontend gửi đến
    const { deviceID, action } = req.body;

    if (!deviceID || !["on", "off"].includes(action)) {
        return res.status(400).json({ error: "Tham số không hợp lệ. Vui lòng kiểm tra 'deviceID' hoặc 'action'." });
    }

    const checkDeviceQuery = "SELECT * FROM devices WHERE id = ?";
    db.query(checkDeviceQuery, [deviceID], (err, results) => {
        if (err) {
            console.error("Lỗi khi kiểm tra thiết bị:", err);
            return res.status(500).json({ error: "Lỗi hệ thống khi kiểm tra thiết bị." });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "Thiết bị không tồn tại." });
        }

        const device = results[0];
        const esp32IP = device.esp32IP;

        if (!esp32IP) {
            return res.status(400).json({ error: "Địa chỉ IP ESP32 chưa được cấu hình cho thiết bị này." });
        }

        const esp32Url = `http://${esp32IP}/control?deviceID=${deviceID}&action=${action}`;
        console.log(`Gửi yêu cầu tới ESP32: ${esp32Url}`); // Log URL gửi đến ESP32

        // Gửi yêu cầu tới ESP32
        axios
            .get(esp32Url, { timeout: 5000 }) // Thêm timeout để tránh treo request
            .then((response) => {
                console.log("Phản hồi từ ESP32:", response.data); // Log phản hồi từ ESP32
                const status = action === "on" ? 1 : 0;
                const updateQuery = "UPDATE devices SET status = ? WHERE id = ?";
                db.query(updateQuery, [status, deviceID], (err) => {
                    if (err) {
                        console.error("Lỗi khi cập nhật trạng thái thiết bị:", err);
                        return res.status(500).json({ error: "Lỗi khi cập nhật trạng thái thiết bị." });
                    }

                    const logQuery = "INSERT INTO Data (deviceID, action) VALUES (?, ?)";
                    db.query(logQuery, [deviceID, action], (err) => {
                        if (err) {
                            console.error("Lỗi khi lưu lịch sử thiết bị:", err);
                            return res.status(500).json({ error: "Lỗi khi lưu lịch sử thiết bị." });
                        }

                        res.json({
                            message: "Thiết bị đã được điều khiển thành công.",
                            esp32Response: response.data, // Phản hồi từ ESP32
                        });
                    });
                });
            })
            .catch((error) => {
                console.error("Lỗi khi gửi yêu cầu tới ESP32:", error.message);
                res.status(500).json({
                    error: "Không thể kết nối với ESP32. Vui lòng kiểm tra kết nối mạng hoặc địa chỉ ESP32.",
                });
            });
    });
};

// Thêm thiết bị mới vào phòng
exports.addDevice = (req, res) => {
    const { name, status, roomID, esp32IP } = req.body;

    if (!name || roomID === undefined || !esp32IP) {
        return res.status(400).json({ error: "Thiếu thông tin thiết bị." });
    }

    const query = "INSERT INTO devices (name, status, roomID, esp32IP) VALUES (?, ?, ?, ?)";
    db.query(query, [name, status || 0, roomID, esp32IP], (err, result) => {
        if (err) {
            console.error("Lỗi khi thêm thiết bị:", err);
            return res.status(500).json({ error: "Lỗi hệ thống khi thêm thiết bị." });
        }

        // Sau khi thêm thiết bị, cập nhật số lượng thiết bị trong bảng rooms
        const updateRoomQuery = "UPDATE rooms SET numberDevices = numberDevices + 1 WHERE id = ?";
        db.query(updateRoomQuery, [roomID], (updateErr) => {
            if (updateErr) {
                console.error("Lỗi khi cập nhật số lượng thiết bị trong phòng:", updateErr);
                return res.status(500).json({ error: "Lỗi hệ thống khi cập nhật số lượng thiết bị trong phòng." });
            }

            res.json({
                message: "Thiết bị đã được thêm thành công!",
                deviceID: result.insertId,
            });
        });
    });
};



// Lấy lịch sử điều khiển thiết bị
exports.getDeviceLogs = (req, res) => {
    const deviceID = req.params.deviceID;

    const query = "SELECT * FROM Data WHERE deviceID = ? ORDER BY timestamp DESC";
    db.query(query, [deviceID], (err, results) => {
        if (err) {
            console.error("Lỗi khi lấy lịch sử thiết bị:", err);
            return res.status(500).json({ error: "Lỗi hệ thống khi lấy lịch sử thiết bị." });
        }

        res.json(results);
    });
};

// Lấy trạng thái thiết bị
exports.getDeviceStatus = (req, res) => {
    const deviceID = req.params.deviceID;

    const query = "SELECT * FROM devices WHERE id = ?";
    db.query(query, [deviceID], (err, results) => {
        if (err) {
            console.error("Lỗi khi lấy trạng thái thiết bị:", err);
            return res.status(500).json({ error: "Lỗi hệ thống khi lấy trạng thái thiết bị." });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "Thiết bị không tồn tại." });
        }

        res.json({
            deviceID: results[0].id,
            name: results[0].name,
            status: results[0].status === 1 ? "on" : "off",
        });
    });
};

// Nhận và lưu dữ liệu cảm biến từ ESP32
exports.saveSensorData = (req, res) => {
    const { temperature, humidity } = req.body;

    if (temperature === undefined || humidity === undefined) {
        return res.status(400).json({ error: "Thiếu dữ liệu nhiệt độ hoặc độ ẩm." });
    }

    const query = "INSERT INTO sensor_data (temperature, humidity) VALUES (?, ?)";
    db.query(query, [temperature, humidity], (err) => {
        if (err) {
            console.error("Lỗi khi lưu dữ liệu cảm biến:", err);
            return res.status(500).json({ error: "Lỗi hệ thống." });
        }

        res.json({ message: "Dữ liệu cảm biến đã được lưu thành công." });
    });
};

// Lấy dữ liệu cảm biến 
exports.getSensorData = (req, res) => {
    // Lấy số lượng bản ghi từ query parameter, nếu không có thì mặc định là 10
    const limit = parseInt(req.query.limit) || 10;

    // Truy vấn cơ sở dữ liệu
    const query = "SELECT * FROM sensor_data ORDER BY timestamp DESC LIMIT ?";
    db.query(query, [limit], (err, results) => {
        if (err) {
            console.error("Lỗi khi lấy dữ liệu cảm biến:", err);
            return res.status(500).json({ error: "Lỗi hệ thống khi lấy dữ liệu cảm biến." });
        }

        // Trả kết quả
        res.json(results);
    });
};


// Lấy danh sách thiết bị theo phòng
exports.getDevicesByRoom = (req, res) => {
    const roomID = req.params.roomID;

    const query = "SELECT * FROM devices WHERE roomID = ?";
    db.query(query, [roomID], (err, results) => {
        if (err) {
            console.error("Lỗi khi lấy thiết bị trong phòng:", err);
            return res.status(500).json({ error: "Lỗi hệ thống khi lấy danh sách thiết bị." });
        }

        res.json(results);
    });
};

// Lấy nhiệt độ và độ ẩm mới nhất
exports.getLatestTemperatureAndHumidity = (req, res) => {
    const query = "SELECT * FROM sensor_data ORDER BY timestamp DESC LIMIT 1";
    db.query(query, (err, results) => {
        if (err) {
            console.error("Lỗi khi lấy dữ liệu cảm biến:", err);
            return res.status(500).json({ error: "Lỗi hệ thống khi lấy dữ liệu nhiệt độ và độ ẩm." });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "Không có dữ liệu nhiệt độ và độ ẩm." });
        }

        res.json(results[0]);
    });
};

/// Xóa thiết bị
exports.deleteDevice = (req, res) => {
    const deviceID = req.params.deviceID;

    const getRoomIDQuery = "SELECT roomID FROM devices WHERE id = ?";
    db.query(getRoomIDQuery, [deviceID], (err, results) => {
        if (err) {
            console.error("Lỗi khi lấy roomID:", err);
            return res.status(500).json({ error: "Lỗi hệ thống khi lấy roomID." });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "Thiết bị không tồn tại." });
        }

        const roomID = results[0].roomID;

        // Xóa thiết bị
        const deleteDeviceQuery = "DELETE FROM devices WHERE id = ?";
        db.query(deleteDeviceQuery, [deviceID], (deleteErr) => {
            if (deleteErr) {
                console.error("Lỗi khi xóa thiết bị:", deleteErr);
                return res.status(500).json({ error: "Lỗi hệ thống khi xóa thiết bị." });
            }

            // Cập nhật số lượng thiết bị trong phòng
            const updateRoomQuery = `
                UPDATE rooms
                SET numberDevices = GREATEST(numberDevices - 1, 0)
                WHERE id = ?`;
            db.query(updateRoomQuery, [roomID], (updateErr) => {
                if (updateErr) {
                    console.error("Lỗi khi cập nhật số lượng thiết bị:", updateErr);
                    return res.status(500).json({ error: "Lỗi khi cập nhật số lượng thiết bị." });
                }

                res.json({ message: "Thiết bị đã được xóa thành công." });
            });
        });
    });
};
