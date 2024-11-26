const express = require("express");
const {
    controlDevice,
    getDeviceLogs,
    getDeviceStatus,
    saveSensorData,
    getSensorData,
    addDevice,
    deleteDevice,
    getAllDeviceLogs,
} = require("../controllers/DeviceController");
const { checkRole } = require("../middlewares/authMiddleware");
const router = express.Router();
const { getLatestTemperatureAndHumidity } = require("../controllers/DeviceController");

// Route điều khiển thiết bị
router.post("/control", checkRole("user"), controlDevice);

// Định nghĩa route thêm thiết bị
router.post("/add-device", checkRole("user"), addDevice);

// Route lấy lịch sử điều khiển của tất cả thiết bị
router.get("/logs/all", checkRole("user"), getAllDeviceLogs);


// Route lấy lịch sử điều khiển thiết bị
router.get("/:deviceID/logs", checkRole("user"), getDeviceLogs);

// Route lấy trạng thái thiết bị
router.get("/:deviceID/status", checkRole("user"), getDeviceStatus);

// Route lưu dữ liệu cảm biến
router.post("/add-sensor-data", saveSensorData);

// Route lấy dữ liệu cảm biến
router.get("/sensor-data", getSensorData);

// Route lấy danh sách thiết bị theo phòng
router.get("/rooms/:roomID/devices", checkRole("user"), require("../controllers/DeviceController").getDevicesByRoom);

// Route để lấy nhiệt độ và độ ẩm mới nhất
router.get("/latest-temperature-humidity", checkRole("user"), getLatestTemperatureAndHumidity);

// Route xóa thiết bị trong phòng
router.delete("/:deviceID", checkRole("user"), deleteDevice);


module.exports = router;
