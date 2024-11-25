import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DeviceList from "./DeviceList";
import AddDeviceForm from "./AddDeviceForm";
import SensorData from "./SensorData";
import "./../styles/RoomList.css";

const RoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoomID, setSelectedRoomID] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Vui lòng đăng nhập trước!");
      navigate("/login");
      return;
    }

    fetch("http://localhost:5000/api/rooms", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (response.status === 401) {
          alert("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.");
          localStorage.removeItem("authToken");
          navigate("/login");
          throw new Error("Unauthorized. Redirecting to login.");
        }
        return response.json();
      })
      .then((data) => setRooms(data))
      .catch((error) => {
        console.error("Lỗi:", error);
      });
  }, [navigate]);

  const refreshDevices = () => {
    if (selectedRoomID) {
      fetch(`http://localhost:5000/api/rooms/${selectedRoomID}/devices`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Danh sách thiết bị đã được cập nhật:", data);
        })
        .catch((error) =>
          console.error("Lỗi khi làm mới danh sách thiết bị:", error)
        );
    }
  };

  return (
    <div className="room-container">
      <h1>Danh sách phòng</h1>
      {rooms.length === 0 ? (
        <p>Không có phòng nào.</p>
      ) : (
        <div className="room-list">
          {rooms.map((room) => (
            <div
              key={room.id}
              className={`room-card ${
                selectedRoomID === room.id ? "selected" : ""
              }`}
              onClick={() => setSelectedRoomID(room.id)}
            >
              <h2>{room.name}</h2>
              <p>{room.numberDevices} thiết bị</p>
            </div>
          ))}
        </div>
      )}
      {selectedRoomID && (
        <>
          <DeviceList roomID={selectedRoomID} />
          <AddDeviceForm roomID={selectedRoomID} onDeviceAdded={refreshDevices} />
        </>
      )}
      <SensorData />
    </div>
  );
};

export default RoomList;
