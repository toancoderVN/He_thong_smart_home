import React, { useState, useEffect } from "react";
import "./../styles/SensorData.css";

const SensorData = () => {
	const [deviceLogs, setDeviceLogs] = useState([]);
	const [sensorLogs, setSensorLogs] = useState([]);

	useEffect(() => {
		const fetchDeviceLogs = async () => {
			const token = localStorage.getItem("authToken");
			// if (!token) return;

			try {
				const response = await fetch(
					"http://localhost:5000/api/devices/logs/all",
					{
						headers: { Authorization: `Bearer ${token}` },
					}
				);
				const data = await response.json();
				setDeviceLogs(data.slice(0, 10)); // Lấy 10 giá trị mới nhất
			} catch (error) {
				console.error("Lỗi khi lấy lịch sử bật/tắt thiết bị:", error);
			}
		};

		const fetchSensorLogs = async () => {
			const token = localStorage.getItem("authToken");
			if (!token) return;

			try {
				const response = await fetch(
					"http://localhost:5000/api/devices/sensor-data",
					{
						headers: { Authorization: `Bearer ${token}` },
					}
				);
				const data = await response.json();
				setSensorLogs(data);
			} catch (error) {
				console.error("Lỗi khi lấy lịch sử nhiệt độ và độ ẩm:", error);
			}
		};

		fetchDeviceLogs();
		fetchSensorLogs();
	}, []);

	return (
		<div className="main-content">
			<h1>Lịch sử Cảm biến và Điều khiển</h1>
			<div className="sensor-data-tables">
				{/* Bảng lịch sử bật/tắt thiết bị */}
				<div className="table-container">
					<h2>Lịch sử bật/tắt thiết bị</h2>
					{deviceLogs.length === 0 ? (
						<p>Không có dữ liệu lịch sử bật/tắt thiết bị.</p>
					) : (
						<table className="data-table">
							<thead>
								<tr>
									<th>STT</th>
									<th>ID Thiết bị</th>
									<th>Hành động</th>
									<th>Thời gian</th>
								</tr>
							</thead>
							<tbody>
								{deviceLogs.map((log, index) => (
									<tr key={log.id}>
										<td>{index + 1}</td>
										<td>{log.deviceID}</td>
										<td>{log.action}</td>
										<td>{new Date(log.timestamp).toLocaleString()}</td>
									</tr>
								))}
							</tbody>
						</table>
					)}
				</div>

				{/* Bảng lịch sử nhiệt độ và độ ẩm */}
				<div className="table-container">
					<h2>Lịch sử nhiệt độ và độ ẩm</h2>
					{sensorLogs.length === 0 ? (
						<p>Không có dữ liệu lịch sử nhiệt độ và độ ẩm.</p>
					) : (
						<table className="data-table">
							<thead>
								<tr>
									<th>STT</th>
									<th>Nhiệt độ (°C)</th>
									<th>Độ ẩm (%)</th>
									<th>Thời gian</th>
								</tr>
							</thead>
							<tbody>
								{sensorLogs.map((log, index) => (
									<tr key={index}>
										<td>{index + 1}</td>
										<td>{log.temperature}</td>
										<td>{log.humidity}</td>
										<td>{new Date(log.timestamp).toLocaleString()}</td>
									</tr>
								))}
							</tbody>
						</table>
					)}
				</div>
			</div>
		</div>
	);
};

export default SensorData;
