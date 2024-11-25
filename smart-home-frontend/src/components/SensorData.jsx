import React, { useState, useEffect } from "react";

const SensorData = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            alert("Bạn cần đăng nhập!");
            return;
        }

        fetch("http://localhost:5000/api/devices/latest-temperature-humidity", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((response) => {
                if (response.status === 401) {
                    alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
                    localStorage.removeItem("authToken");
                    window.location.href = "/login";
                }
                return response.json();
            })
            .then((data) => setData([data]))
            .catch((error) =>
                console.error("Lỗi khi lấy dữ liệu nhiệt độ và độ ẩm:", error)
            );
    }, []);

    return (
        <div>
            <h1>Dữ liệu cảm biến</h1>
            {data.length === 0 ? (
                <p>Không có dữ liệu.</p>
            ) : (
                <table border="1" style={{ width: "100%", textAlign: "center" }}>
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Nhiệt độ (°C)</th>
                            <th>Độ ẩm (%)</th>
                            <th>Thời gian</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((record, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{record.temperature}</td>
                                <td>{record.humidity}</td>
                                <td>{new Date(record.timestamp).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default SensorData;
