import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import RoomList from "./components/RoomList";
import SensorData from "./components/SensorData";
import UserManagement from "./components/UserManagement";

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/rooms" element={<RoomList />} />
                <Route path="/sensor-data" element={<SensorData />} />
                <Route path="/users" element={<UserManagement />} />
                <Route path="/" element={<Login />} />
            </Routes>
        </Router>
    );
};

export default App;
