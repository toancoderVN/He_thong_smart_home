import React, { useEffect, useState } from "react";
import api from "../services/api";
import "./../styles/DeviceList.css";

const DeviceList = ({ roomID }) => {
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
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

    api
      .post(
        `/devices/control`,
        { deviceID, action },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        alert(response.data.message);
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
        alert(errorMessage);
      });
  };

  const deleteDevice = (deviceID) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Bạn cần đăng nhập!");
      return;
    }

    if (window.confirm("Bạn có chắc chắn muốn xóa thiết bị này?")) {
      api
        .delete(`/devices/${deviceID}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          alert("Thiết bị đã được xóa thành công!");
          setDevices((prevDevices) =>
            prevDevices.filter((device) => device.id !== deviceID)
          );
        })
        .catch((error) => {
          console.error("Lỗi khi xóa thiết bị:", error);
          const errorMessage =
            error.response?.data?.error ||
            "Không thể xóa thiết bị. Vui lòng thử lại!";
          alert(errorMessage);
        });
    }
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
              <div className="device-info">
                <div className="device-name-status">
                  <span className="device-name">{device.name}</span>
                  <span
                    className={`device-status ${
                      device.status === 1 ? "active" : "inactive"
                    }`}
                  >
                    {device.status === 1 ? "Bật" : "Tắt"}
                  </span>
                </div>
              </div>
              <div className="device-buttons">
                <button
                  className="device-button on"
                  onClick={() => controlDevice(device.id, "on")}
                >
                  Bật
                </button>
                <button
                  className="device-button off"
                  onClick={() => controlDevice(device.id, "off")}
                >
                  Tắt
                </button>
                <button
                  className="device-button delete"
                  onClick={() => deleteDevice(device.id)}
                >
                  Xóa
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DeviceList;
