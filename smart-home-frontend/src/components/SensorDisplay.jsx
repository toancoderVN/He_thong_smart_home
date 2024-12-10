import React, { useState, useEffect } from "react";
import "./../styles/SensorDisplay.css";

const SensorDisplay = () => {
	const [sensorData, setSensorData] = useState({
		temperature: "--",
		humidity: "--",
	});

	useEffect(() => {
		const fetchSensorData = async () => {
			const token = localStorage.getItem("authToken");
			// if (!token) {
			//   console.error("Token không tồn tại. Người dùng chưa đăng nhập.");
			//   return;
			// }

			try {
				const response = await fetch(
					"http://localhost:5000/api/devices/latest-temperature-humidity",
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);

				if (!response.ok) {
					throw new Error("Không thể lấy dữ liệu cảm biến.");
				}

				const data = await response.json();
				if (
					data &&
					data.temperature !== undefined &&
					data.humidity !== undefined
				) {
					setSensorData({
						temperature: data.temperature.toFixed(1),
						humidity: data.humidity.toFixed(1),
					});
				} else {
					console.error("Dữ liệu API không hợp lệ:", data);
				}
			} catch (error) {
				console.error("Lỗi khi lấy dữ liệu cảm biến:", error);
			}
		};

		fetchSensorData();
		const interval = setInterval(fetchSensorData, 60000); // Tự động cập nhật mỗi phút

		return () => clearInterval(interval); // Dọn dẹp interval khi component bị unmount
	}, []);

	return (
		<div className="sensor-display">
			<p>
				Nhiệt độ: <strong>{sensorData.temperature}°C</strong>
			</p>
			<p>
				Độ ẩm: <strong>{sensorData.humidity}%</strong>
			</p>
		</div>
	);
};

export default SensorDisplay;
