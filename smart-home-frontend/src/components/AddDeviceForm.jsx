import React, { useState } from "react";

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
        <div>
            <h3>Thêm thiết bị mới</h3>
            <input
                type="text"
                placeholder="Tên thiết bị"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
            />
            <input
                type="text"
                placeholder="Địa chỉ IP ESP32"
                value={esp32IP}
                onChange={(e) => setEsp32IP(e.target.value)}
            />
            <button onClick={handleAddDevice}>Thêm thiết bị</button>
        </div>
    );
};

export default AddDeviceForm;
