import React, { useState } from "react";
import "./../styles/AddDeviceForm.css";

const AddDeviceForm = ({ roomID, onDeviceAdded }) => {
  const [deviceName, setDeviceName] = useState("");
  const [esp32IP, setEsp32IP] = useState("");

  const handleAddDevice = () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Bạn cần đăng nhập!");
      return;
    }

    fetch("http://localhost:5000/api/devices/add-device", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: deviceName, roomID, esp32IP }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          alert(`Lỗi: ${data.error}`);
        } else {
          alert(data.message);
          setDeviceName("");
          setEsp32IP("");
          if (onDeviceAdded) onDeviceAdded();
        }
      })
      .catch((error) => {
        console.error("Lỗi khi thêm thiết bị:", error);
        alert("Không thể thêm thiết bị. Vui lòng thử lại!");
      });
  };

  return (
    <div className="add-device-form-container">
      <h3 className="form-title">Thêm thiết bị mới</h3>
      <div className="form-group">
        <label className="form-label">Tên thiết bị</label>
        <input
          type="text"
          className="form-input"
          placeholder="Nhập tên thiết bị"
          value={deviceName}
          onChange={(e) => setDeviceName(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label className="form-label">Địa chỉ IP ESP32</label>
        <input
          type="text"
          className="form-input"
          placeholder="Nhập địa chỉ IP ESP32"
          value={esp32IP}
          onChange={(e) => setEsp32IP(e.target.value)}
        />
      </div>
      <button className="form-button" onClick={handleAddDevice}>
        Thêm thiết bị
      </button>
    </div>
  );
};

export default AddDeviceForm;
