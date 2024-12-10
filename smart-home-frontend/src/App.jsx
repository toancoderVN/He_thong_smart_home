import React, { useEffect } from "react";
import {
	BrowserRouter as Router,
	Route,
	Routes,
	useLocation,
	Navigate,
	useNavigate,
} from "react-router-dom";
import Login from "./components/Login";
import RoomList from "./components/RoomList";
import SensorData from "./components/SensorData";
import UserManagement from "./components/UserManagement";
import About from "./components/About";
import SensorDisplay from "./components/SensorDisplay";
import Navbar from "./components/Navbar";
import { NotificationContainer } from "react-notifications";
import { StyleProvider } from "@ant-design/cssinjs";

const App = () => {
	return (
		<Router>
			<StyleProvider hashPriority="high">
				<AppLayout>
					<Routes>
						<Route path="/login" element={<Login />} />
						<Route path="/rooms" element={<RoomList />} />
						<Route path="/sensor-data" element={<SensorData />} />
						<Route path="/users" element={<UserManagement />} />
						<Route path="/about" element={<About />} />
						<Route path="/" element={<Navigate to="/login" />} />
					</Routes>
					<NotificationContainer />
				</AppLayout>
			</StyleProvider>
		</Router>
	);
};

// Tạo component AppLayout để điều chỉnh layout động
const AppLayout = ({ children }) => {
	const navigate = useNavigate();
	const location = useLocation(); // Lấy đường dẫn hiện tại

	const isLoginPage = location.pathname === "/login"; // Kiểm tra nếu là trang đăng nhập
	useEffect(() => {
		console.log("first");
		const token = localStorage.getItem("authToken");
		if (!token) navigate("/login");
	}, [location.pathname, navigate]);

	return (
		<div>
			{!isLoginPage && <Navbar />} {/* Hiển thị Navbar trừ trang đăng nhập */}
			{!isLoginPage && <SensorDisplay />}{" "}
			{/* Hiển thị SensorDisplay trừ trang đăng nhập */}
			{children} {/* Nội dung chính của trang */}
		</div>
	);
};

export default App;
