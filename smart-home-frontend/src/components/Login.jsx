import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./../styles/Login.css"; // Import file CSS riêng
import logo from "./../images/logo.png"; // Import logo
import { NotificationManager } from "react-notifications";
import { Button, Form, Input } from "antd";

const Login = () => {
	const [errorMessage, setErrorMessage] = useState("");
	const navigate = useNavigate();
	const [form] = Form.useForm();

	useEffect(() => {
		if (window.location.pathname === "/") {
			navigate("/login");
		}
	}, [navigate]);

	const handleSubmit = () => {
		form.validateFields().then(() => handleLogin());
	};

	const handleLogin = () => {
		const username = form.getFieldValue("username");
		const password = form.getFieldValue("password");

		fetch("http://localhost:5000/api/users/login", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ username, password }),
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error("Đăng nhập thất bại! Vui lòng kiểm tra tài khoản.");
				}
				return response.json();
			})
			.then((data) => {
				localStorage.setItem("authToken", data.token);

				const decodedToken = JSON.parse(atob(data.token.split(".")[1]));
				const role = decodedToken.role;

				// alert("Đăng nhập thành công!");
				NotificationManager.success("Đăng nhập thành công", "Success message");
				setErrorMessage("");
				if (role === "admin") {
					navigate("/users");
				} else {
					navigate("/rooms");
				}
			})
			.catch((error) => {
				console.error("Lỗi khi đăng nhập:", error);
				setErrorMessage("Tên đăng nhập hoặc mật khẩu không chính xác.");
			});
	};

	return (
		// <div className="login-container">
		// 	<div className="login-header">
		// 		<img
		// 			src={logo}
		// 			alt="Logo"
		// 			className="logo"
		// 			style={{ borderRadius: "0px" }}
		// 		/>
		// 		<h1>Hệ thống Quản lý Nhà thông minh</h1>
		// 		<div class="footer">
		// 			<p>&copy; 2024 Nhóm phát triển: A, B, C, D, E</p>
		// 		</div>
		// 	</div>
		// 	<div className="login-form">
		// 		<input
		// 			type="text"
		// 			placeholder="Tên đăng nhập"
		// 			value={username}
		// 			onChange={(e) => setUsername(e.target.value)}
		// 		/>
		// 		<input
		// 			type="password"
		// 			placeholder="Mật khẩu"
		// 			value={password}
		// 			onChange={(e) => setPassword(e.target.value)}
		// 		/>
		// 		<button onClick={handleLogin}>Đăng nhập</button>
		// 		{errorMessage && (
		// 			<p
		// 				className="error-message"
		// 				style={{
		// 					color: "red",
		// 					marginTop: "10px",
		// 					fontSize: "14px",
		// 				}}
		// 			>
		// 				{errorMessage}
		// 			</p>
		// 		)}
		// 	</div>
		// </div>
		<div className="login-container">
			<div className="login-header">
				<img
					src={logo}
					alt="Logo"
					className="logo"
					style={{ borderRadius: "0px" }}
				/>
				<h1>Hệ thống Quản lý Nhà thông minh</h1>
				<div className="footer">
					<p>&copy; 2024 Nhóm phát triển: A, B, C, D, E</p>
				</div>
			</div>
			<div className="login-form">
				<Form
					layout="vertical"
					onFinish={handleSubmit}
					form={form}
					// initialValues={{ username, password }}
				>
					<Form.Item
						label="Tên đăng nhập"
						name="username"
						placement="left"
						rules={[
							{ required: true, message: "Vui lòng nhập tên đăng nhập!" },
						]}
					>
						<Input
							placeholder="Tên đăng nhập"
							style={{ height: "40px" }}
							// value={username}
							// onChange={(e) => setUsername(e.target.value)}
						/>
					</Form.Item>

					<Form.Item
						label="Mật khẩu"
						name="password"
						rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
					>
						<Input.Password
							placeholder="Mật khẩu"
							style={{ height: "40px" }}
							// value={password}
							// onChange={(e) => setPassword(e.target.value)}
							// iconRender={(visible) =>
							// 	visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
							// }
						/>
					</Form.Item>

					<Form.Item>
						<Button
							type="primary"
							block
							// onClick={handleLogin}
							htmlType="submit"
							style={{ marginTop: "10px", height: "40px" }}
						>
							Đăng nhập
						</Button>
					</Form.Item>

					{errorMessage && (
						<p
							className="error-message"
							style={{
								color: "red",
								marginTop: "10px",
								fontSize: "14px",
							}}
						>
							{errorMessage}
						</p>
					)}
				</Form>
			</div>
		</div>
	);
};

export default Login;
