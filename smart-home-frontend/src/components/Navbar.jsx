import React from "react";
import { Link } from "react-router-dom";
import "./../styles/Navbar.css"; // CSS cho thanh điều hướng

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/rooms" className="navbar-logo">
          Smart Home
        </Link>
        <ul className="navbar-menu">
          <li>
            <Link to="/rooms">Danh sách phòng</Link>
          </li>
          <li>
            <Link to="/sensor-data">Dữ liệu cảm biến</Link>
          </li>
          <li>
            <Link to="/about">Giới thiệu</Link>
          </li>
          <li>
            <Link to="/login" onClick={() => localStorage.clear()}>
              Đăng xuất
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
