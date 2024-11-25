import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./../styles/Login.css"; // Import file CSS riêng
import logo from "./../images/logo.png"; // Import logo

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (window.location.pathname === "/") {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogin = () => {
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

        alert("Đăng nhập thành công!");
        if (role === "admin") {
          navigate("/users");
        } else {
          navigate("/rooms");
        }
      })
      .catch((error) => {
        console.error("Lỗi khi đăng nhập:", error);
        alert(error.message || "Đăng nhập thất bại. Vui lòng thử lại!");
      });
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <img src={logo} alt="Logo" className="logo" />
        <h1>Chào mừng đến với Hệ thống Quản lý Nhà thông minh</h1>
        <p>Cùng nhóm phát triển: A, B, C, D, E</p>
      </div>
      <div className="login-form">
        <input
          type="text"
          placeholder="Tên đăng nhập"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Đăng nhập</button>
      </div>
    </div>
  );
};

export default Login;
