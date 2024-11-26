import React from "react";
import "./../styles/About.css";

const About = () => {
  return (
    <div className="about-container">
      <h1 className="about-title">Giới thiệu về ứng dụng</h1>
      <p className="about-description">
        Ứng dụng quản lý thiết bị IoT được thiết kế để giúp bạn dễ dàng quản lý các thiết bị thông minh trong ngôi nhà của mình.
      </p>
      <div className="team-section">
        <h2>Đội ngũ phát triển</h2>
        <ul>
          <li>Nguyễn Văn A - Frontend Developer</li>
          <li>Trần Thị B - Backend Developer</li>
          <li>Lê Văn C - IoT Specialist</li>
          <li>Phạm Thị D - UX/UI Designer</li>
          <li>Đỗ Văn E - Tester</li>
        </ul>
      </div>
      <div className="contact-section">
        <h2>Liên hệ</h2>
        <p>Email: contact@iotapp.com</p>
        <p>Hotline: 0123-456-789</p>
      </div>
    </div>
  );
};

export default About;
