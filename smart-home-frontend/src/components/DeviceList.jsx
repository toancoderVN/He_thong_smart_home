import React, { useEffect, useState } from "react";
import api from "../services/api";
import "./../styles/DeviceList.css";
import { Button, Dropdown, Modal, Tag } from "antd";
import {
	DeleteOutlined,
	ExclamationCircleFilled,
	PoweroffOutlined,
	SmallDashOutlined,
	StopOutlined,
	UserOutlined,
} from "@ant-design/icons";
import { NotificationManager } from "react-notifications";

const DeviceList = ({ roomID }) => {
	const [devices, setDevices] = useState([]);

	const { confirm } = Modal;

	const showConfirm = (id) => {
		confirm({
			title: `Bạn có chắc chắn muốn xoá thiệt bị này?`,
			icon: <ExclamationCircleFilled />,
			content: "",
			onOk() {
				deleteDevice(id);
			},
			onCancel() {
				// console.log("Cancel");
			},
		});
	};

	useEffect(() => {
		const token = localStorage.getItem("authToken");
		// if (!token) {
		//   alert("Bạn cần đăng nhập!");
		//   return;
		// }

		api
			.get(`/rooms/${roomID}/devices`, {
				headers: { Authorization: `Bearer ${token}` },
			})
			.then((response) => {
				setDevices(response.data);
			})
			.catch((error) => {
				console.error("Lỗi khi lấy danh sách thiết bị:", error);
				if (error.response?.status === 401) {
					// alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
					NotificationManager.error(
						"Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!"
					);
					localStorage.removeItem("authToken");
					window.location.href = "/login";
				}
			});
	}, [roomID]);

	const controlDevice = (deviceID, action) => {
		const token = localStorage.getItem("authToken");
		if (!token) {
			alert("Bạn cần đăng nhập!");
			return;
		}

		api
			.post(
				`/devices/control`,
				{ deviceID, action },
				{ headers: { Authorization: `Bearer ${token}` } }
			)
			.then((response) => {
				//alert(response.data.message);
				setDevices((prevDevices) =>
					prevDevices.map((device) =>
						device.id === deviceID
							? { ...device, status: action === "on" ? 1 : 0 }
							: device
					)
				);
			})
			.catch((error) => {
				console.error("Lỗi khi điều khiển thiết bị:", error);
				const errorMessage =
					error.response?.data?.error ||
					"Không thể điều khiển thiết bị. Vui lòng thử lại!";
				// alert(errorMessage);
				NotificationManager.error(errorMessage);
			});
	};

	const deleteDevice = (deviceID) => {
		const token = localStorage.getItem("authToken");
		if (!token) {
			alert("Bạn cần đăng nhập!");
			return;
		}

		// if (window.confirm("Bạn có chắc chắn muốn xóa thiết bị này?")) {
		api
			.delete(`/devices/${deviceID}`, {
				headers: { Authorization: `Bearer ${token}` },
			})
			.then((response) => {
				// alert("Thiết bị đã được xóa thành công!");
				NotificationManager.success("Thiết bị đã được xóa thành công!");
				setDevices((prevDevices) =>
					prevDevices.filter((device) => device.id !== deviceID)
				);
			})
			.catch((error) => {
				console.error("Lỗi khi xóa thiết bị:", error);
				const errorMessage =
					error.response?.data?.error ||
					"Không thể xóa thiết bị. Vui lòng thử lại!";
				// alert(errorMessage);
				NotificationManager.error(errorMessage);
			});
		// }
	};

	return (
		<div className="device-list-container">
			<h2 className="device-list-title">Thiết bị trong phòng</h2>
			{devices.length === 0 ? (
				<p className="no-devices">Không có thiết bị nào trong phòng này.</p>
			) : (
				<ul className="device-list">
					{devices.map((device) => (
						<li key={device.id} className="device-item">
							<div
								style={{
									width: "100%",
									display: "flex",
									alignItems: "center",
									justifyContent: "flex-end",
								}}
							>
								<Dropdown
									menu={{
										items: [
											{
												label: "Bật",
												key: "1",
												icon: <PoweroffOutlined />,
												onClick: () => controlDevice(device.id, "on"),
											},
											{
												label: "Tắt",
												key: "2",
												icon: <StopOutlined />,
												onClick: () => controlDevice(device.id, "off"),
											},
											{
												label: "Xoá",
												key: "3",
												icon: <DeleteOutlined />,
												danger: true,
												onClick: () => showConfirm(device.id), //deleteDevice(device.id),
											},
										],
									}}
									arrow={{
										pointAtCenter: true,
									}}
								>
									<Button>
										<SmallDashOutlined />
									</Button>
								</Dropdown>
							</div>

							<div className="device-info">
								<div className="device-name-status">
									<span className="device-name">{device.name}</span>
									<span className={`device-status`}>
										{device.status === 1 ? (
											<Tag color="#87d068">Bật</Tag>
										) : (
											<Tag color="#f50">Tắt</Tag>
										)}
									</span>
								</div>
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

export default DeviceList;
