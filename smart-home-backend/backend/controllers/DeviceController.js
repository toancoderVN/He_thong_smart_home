const deviceService = require("../services/DeviceService");
const axios = require("axios");

// Điều khiển thiết bị
exports.controlDevice = async (req, res) => {
    try {
        const { deviceID, action } = req.body;

        if (!deviceID || !["on", "off"].includes(action)) {
            return res.status(400).json({ error: "Tham số không hợp lệ. Vui lòng kiểm tra 'deviceID' hoặc 'action'." });
        }

        const devices = await deviceService.checkDeviceExists(deviceID);
        if (devices.length === 0) {
            return res.status(404).json({ error: "Thiết bị không tồn tại." });
        }

        const device = devices[0];
        const esp32IP = device.esp32IP;

        if (!esp32IP) {
            return res.status(400).json({ error: "Địa chỉ IP ESP32 chưa được cấu hình cho thiết bị này." });
        }

        const esp32Url = `http://${esp32IP}/control?deviceID=${deviceID}&action=${action}`;
        const response = await axios.get(esp32Url, { timeout: 5000 });

        const status = action === "on" ? 1 : 0;
        await deviceService.updateDeviceStatus(deviceID, status);
        await deviceService.logDeviceAction(deviceID, action);

        res.json({
            message: "Thiết bị đã được điều khiển thành công.",
            esp32Response: response.data,
        });
    } catch (error) {
        console.error("Lỗi khi điều khiển thiết bị:", error.message);
        res.status(500).json({ error: "Không thể kết nối với ESP32 hoặc lỗi hệ thống." });
    }
};

// Thêm thiết bị mới vào phòng
exports.addDevice = async (req, res) => {
    try {
        const { name, status, roomID, esp32IP } = req.body;

        if (!name || roomID === undefined || !esp32IP) {
            return res.status(400).json({ error: "Thiếu thông tin thiết bị." });
        }

        const deviceID = await deviceService.addDevice(name, status, roomID, esp32IP);
        await deviceService.updateRoomDeviceCount(roomID, 1);

        res.json({
            message: "Thiết bị đã được thêm thành công!",
            deviceID: deviceID,
        });
    } catch (error) {
        console.error("Lỗi khi thêm thiết bị:", error.message);
        res.status(500).json({ error: "Lỗi hệ thống khi thêm thiết bị." });
    }
};



// Lấy lịch sử điều khiển thiết bị
exports.getDeviceLogs = async (req, res) => {
    try {
        const deviceID = req.params.deviceID;
        const logs = await deviceService.getDeviceLogs(deviceID);
        res.json(logs);
    } catch (error) {
        console.error("Lỗi khi lấy lịch sử thiết bị:", error.message);
        res.status(500).json({ error: "Lỗi hệ thống khi lấy lịch sử thiết bị." });
    }
};

// Lấy trạng thái thiết bị
exports.getDeviceStatus = async (req, res) => {
    try {
        const deviceID = req.params.deviceID;
        const devices = await deviceService.getDeviceStatus(deviceID);

        if (devices.length === 0) {
            return res.status(404).json({ error: "Thiết bị không tồn tại." });
        }

        const device = devices[0];
        res.json({
            deviceID: device.id,
            name: device.name,
            status: device.status === 1 ? "on" : "off",
        });
    } catch (error) {
        console.error("Lỗi khi lấy trạng thái thiết bị:", error.message);
        res.status(500).json({ error: "Lỗi hệ thống khi lấy trạng thái thiết bị." });
    }
};


// Nhận và lưu dữ liệu cảm biến từ ESP32
exports.saveSensorData = async (req, res) => {
    try {
        const { temperature, humidity } = req.body;

        if (temperature === undefined || humidity === undefined) {
            return res.status(400).json({ error: "Thiếu dữ liệu nhiệt độ hoặc độ ẩm." });
        }

        await deviceService.saveSensorData(temperature, humidity);
        res.json({ message: "Dữ liệu cảm biến đã được lưu thành công." });
    } catch (error) {
        console.error("Lỗi khi lưu dữ liệu cảm biến:", error.message);
        res.status(500).json({ error: "Lỗi hệ thống khi lưu dữ liệu cảm biến." });
    }
};

// Lấy dữ liệu cảm biến 
exports.getSensorData = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const data = await deviceService.getSensorData(limit);
        res.json(data);
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu cảm biến:", error.message);
        res.status(500).json({ error: "Lỗi hệ thống khi lấy dữ liệu cảm biến." });
    }
};


// Lấy danh sách thiết bị theo phòng
exports.getDevicesByRoom = async (req, res) => {
    try {
        const roomID = req.params.roomID;
        const devices = await deviceService.getDevicesByRoom(roomID);
        res.json(devices);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách thiết bị:", error.message);
        res.status(500).json({ error: "Lỗi hệ thống khi lấy danh sách thiết bị." });
    }
};

// Lấy nhiệt độ và độ ẩm mới nhất
exports.getLatestTemperatureAndHumidity = async (req, res) => {
    try {
        const data = await deviceService.getLatestTemperatureAndHumidity();
        if (data.length === 0) {
            return res.status(404).json({ error: "Không có dữ liệu nhiệt độ và độ ẩm." });
        }
        res.json(data[0]);
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu cảm biến mới nhất:", error.message);
        res.status(500).json({ error: "Lỗi hệ thống khi lấy dữ liệu nhiệt độ và độ ẩm." });
    }
};

/// Xóa thiết bị
exports.deleteDevice = async (req, res) => {
    try {
        const deviceID = req.params.deviceID;

        const devices = await deviceService.checkDeviceExists(deviceID);
        if (devices.length === 0) {
            return res.status(404).json({ error: "Thiết bị không tồn tại." });
        }

        const roomID = devices[0].roomID;

        await deviceService.deleteDevice(deviceID);
        await deviceService.updateRoomDeviceCount(roomID, -1);

        res.json({ message: "Thiết bị đã được xóa thành công." });
    } catch (error) {
        console.error("Lỗi khi xóa thiết bị:", error.message);
        res.status(500).json({ error: "Lỗi hệ thống khi xóa thiết bị." });
    }
};