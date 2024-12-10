import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DeviceList from "./DeviceList";
import AddDeviceForm from "./AddDeviceForm";
import "./../styles/RoomList.css";

const RoomList = () => {
	const [rooms, setRooms] = useState([]);
	const [selectedRoomID, setSelectedRoomID] = useState(null);
	const [showAddDeviceForm, setShowAddDeviceForm] = useState(false); // Trạng thái hiển thị form
	const navigate = useNavigate();

	useEffect(() => {
		const token = localStorage.getItem("authToken");

		// if (!token) {
		// 	alert("Vui lòng đăng nhập trước!");
		// 	navigate("/login");
		// 	return;
		// }

		fetch("http://localhost:5000/api/rooms", {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
			.then((response) => {
				if (response.status === 401) {
					// alert("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.");
					// localStorage.removeItem("authToken");
					// navigate("/login");
					// throw new Error("Unauthorized. Redirecting to login.");
				}
				return response.json();
			})
			.then((data) => setRooms(data))
			.catch((error) => {
				console.error("Lỗi:", error);
			});
	}, [navigate]);

	const toggleRoom = (roomID) => {
		setSelectedRoomID(selectedRoomID === roomID ? null : roomID);
		setShowAddDeviceForm(false); // Ẩn form khi chuyển phòng
	};

	const toggleAddDeviceForm = () => {
		setShowAddDeviceForm((prev) => !prev); // Đảo trạng thái hiển thị form
	};

	return (
		<div className="room-container">
			{!selectedRoomID ? (
				<>
					<h1 className="room-title">Danh sách phòng</h1>
					<div className="room-list">
						{rooms.map((room) => (
							<div
								key={room.id}
								className="room-card"
								onClick={() => toggleRoom(room.id)}
							>
								<h2>{room.name}</h2>
								<p>{room.numberDevices} thiết bị</p>
							</div>
						))}
					</div>
				</>
			) : (
				<div className="room-details-container">
					<h1>{rooms.find((room) => room.id === selectedRoomID)?.name}</h1>
					<DeviceList roomID={selectedRoomID} />
					<button
						className={`add-device-button ${showAddDeviceForm ? "active" : ""}`}
						onClick={toggleAddDeviceForm}
					>
						{showAddDeviceForm ? "Đóng thêm thiết bị" : "Thêm thiết bị mới"}
					</button>
					{showAddDeviceForm && (
						<div className="add-device-form-wrapper">
							<AddDeviceForm
								roomID={selectedRoomID}
								onDeviceAdded={() => {
									console.log("Thiết bị mới được thêm");
									setShowAddDeviceForm(false); // Ẩn form sau khi thêm
								}}
							/>
						</div>
					)}
					<button
						className="back-button"
						onClick={() => setSelectedRoomID(null)}
					>
						Quay lại
					</button>
				</div>
			)}
		</div>
	);
};

export default RoomList;
