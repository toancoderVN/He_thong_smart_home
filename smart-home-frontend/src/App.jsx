import React from "react";
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from "react-router-dom";
import Login from "./components/Login";
import RoomList from "./components/RoomList";
import SensorData from "./components/SensorData";
import UserManagement from "./components/UserManagement";
import About from "./components/About";
import SensorDisplay from "./components/SensorDisplay";
import Navbar from "./components/Navbar";

const App = () => {
  const isAuthenticated = !!localStorage.getItem("authToken"); // Kiểm tra trạng thái đăng nhập

  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/rooms"
            element={isAuthenticated ? <RoomList /> : <Navigate to="/login" />}
          />
          <Route
            path="/sensor-data"
            element={isAuthenticated ? <SensorData /> : <Navigate to="/login" />}
          />
          <Route
            path="/users"
            element={isAuthenticated ? <UserManagement /> : <Navigate to="/login" />}
          />
          <Route
            path="/about"
            element={isAuthenticated ? <About /> : <Navigate to="/login" />}
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </AppLayout>
    </Router>
  );
};

// Tạo component AppLayout để điều chỉnh layout động
const AppLayout = ({ children }) => {
  const location = useLocation(); // Lấy đường dẫn hiện tại

  const isLoginPage = location.pathname === "/login"; // Kiểm tra nếu là trang đăng nhập

  return (
    <div>
      {!isLoginPage && <Navbar />} {/* Hiển thị Navbar trừ trang đăng nhập */}
      {!isLoginPage && <SensorDisplay />} {/* Hiển thị SensorDisplay trừ trang đăng nhập */}
      {children} {/* Nội dung chính của trang */}
    </div>
  );
};

export default App;
