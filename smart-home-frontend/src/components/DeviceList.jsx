import React, { useEffect, useState } from "react";
import api from "../services/api";

const DeviceList = ({ roomID }) => {
    const [devices, setDevices] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        console.log("token",token)
        if (!token) {
          alert("Bạn cần đăng nhập!");
          return;
        }
      
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
              alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
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
    
        api.post(
            `/devices/control`, // Thêm "/devices" vào URL
            { deviceID, action },
            { headers: { Authorization: `Bearer ${token}` } } // Gửi kèm token
        )
            .then((response) => {
                alert(response.data.message);
                // Cập nhật trạng thái của thiết bị
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
                    error.response?.data?.error || "Không thể điều khiển thiết bị. Vui lòng thử lại!";
                alert(errorMessage);
            });
    };
    
const deleteDevice = (deviceID) => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            alert("Bạn cần đăng nhập!");
            return;
        }
    
         // Xác nhận trước khi xóa
        const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa thiết bị này?");
        if (!confirmDelete) {
            return; // Dừng nếu người dùng chọn "Cancel"
        }

        // Gửi yêu cầu xóa thiết bị
        api.delete(`/devices/${deviceID}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((response) => {
                alert("Thiết bị đã được xóa thành công!");
                // Cập nhật danh sách thiết bị sau khi xóa
                setDevices((prevDevices) => prevDevices.filter((device) => device.id !== deviceID));
            })
            .catch((error) => {
                console.error("Lỗi khi xóa thiết bị:", error);
                const errorMessage = error.response?.data?.error || "Không thể xóa thiết bị. Vui lòng thử lại!";
                alert(errorMessage);
            });
    };
    

    return (
        <div>
            <h2>Thiết bị trong phòng</h2>
            <ul>
                {devices.map((device) => (
                    <li key={device.id}>
                        {device.name} - {device.status === 1 ? "Bật" : "Tắt"}{" "}
                        <button onClick={() => controlDevice(device.id, "on")}>
                            Bật
                        </button>{" "}
                        <button onClick={() => controlDevice(device.id, "off")}>
                            Tắt
                        </button>
                        <button onClick={() => deleteDevice(device.id)}>
                            Xóa
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DeviceList;
