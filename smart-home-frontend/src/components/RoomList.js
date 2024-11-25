import React, { useEffect, useState } from "react";
import api from "../services/api";
import DeviceList from "./DeviceList";

const RoomList = () => {
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);

    useEffect(() => {
        api.get("/rooms")
            .then((response) => {
                setRooms(response.data);
            })
            .catch((error) => {
                console.error("Lỗi khi lấy danh sách phòng:", error);
            });
    }, []);

    return (
        <div>
            <h1>Danh sách phòng</h1>
            <ul>
                {rooms.map((room) => (
                    <li key={room.id} onClick={() => setSelectedRoom(room.id)}>
                        {room.name} - {room.numberDevices} thiết bị
                    </li>
                ))}
            </ul>
            {selectedRoom && <DeviceList roomID={selectedRoom} />}
        </div>
    );
};

export default RoomList;
