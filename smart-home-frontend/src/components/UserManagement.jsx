import React, { useEffect, useState } from "react";
import api from "../services/api";

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ username: "", password: "", role: "user" });

    // Lấy danh sách người dùng
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = () => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            alert("Bạn cần đăng nhập!");
            return;
        }

        api.get("/users", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((response) => setUsers(response.data))
            .catch((error) => console.error("Lỗi khi lấy danh sách người dùng:", error));
    };

    // Thêm người dùng mới
    const handleAddUser = () => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            alert("Bạn cần đăng nhập!");
            return;
        }

        api.post("/users/register", newUser, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(() => {
                alert("Thêm người dùng thành công!");
                fetchUsers();
                setNewUser({ username: "", password: "", role: "user" });
            })
            .catch((error) => {
                console.error("Lỗi khi thêm người dùng:", error);
                alert("Không thể thêm người dùng.");
            });
    };

    // Xóa người dùng
    const handleDeleteUser = (userId) => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            alert("Bạn cần đăng nhập!");
            return;
        }

        if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
            api.delete(`/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then(() => {
                    alert("Xóa người dùng thành công!");
                    fetchUsers();
                })
                .catch((error) => {
                    console.error("Lỗi khi xóa người dùng:", error);
                    alert("Không thể xóa người dùng.");
                });
        }
    };

    return (
        <div>
            <h1>Quản lý người dùng</h1>
            <table border="1" style={{ width: "100%", textAlign: "center" }}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tên đăng nhập</th>
                        <th>Vai trò</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.username}</td>
                            <td>{user.role}</td>
                            <td>
                                <button onClick={() => handleDeleteUser(user.id)}>Xóa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h2>Thêm người dùng mới</h2>
            <div>
                <input
                    type="text"
                    placeholder="Tên đăng nhập"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                />
                <input
                    type="password"
                    placeholder="Mật khẩu"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
                <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
                <button onClick={handleAddUser}>Thêm người dùng</button>
            </div>
        </div>
    );
};

export default UserManagement;
