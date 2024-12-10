import React, { useEffect, useState } from "react";
import "./../styles/UserManagement.css"; // Import CSS đã thiết kế

const UserManagement = () => {
	const [users, setUsers] = useState([]);
	const [newUser, setNewUser] = useState({
		username: "",
		password: "",
		role: "user",
	});

	// Lấy danh sách người dùng
	useEffect(() => {
		fetchUsers();
	}, []);

	const fetchUsers = () => {
		const token = localStorage.getItem("authToken");
		// if (!token) {
		//     alert("Bạn cần đăng nhập!");
		//     return;
		// }

		fetch("http://localhost:5000/api/users", {
			headers: { Authorization: `Bearer ${token}` },
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error("Không thể lấy danh sách người dùng.");
				}
				return response.json();
			})
			.then((data) => setUsers(data))
			.catch((error) =>
				console.error("Lỗi khi lấy danh sách người dùng:", error)
			);
	};

	// Thêm người dùng mới
	const handleAddUser = () => {
		const token = localStorage.getItem("authToken");
		if (!token) {
			alert("Bạn cần đăng nhập!");
			return;
		}

		fetch("http://localhost:5000/api/users/register", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(newUser),
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error("Không thể thêm người dùng.");
				}
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
			fetch(`http://localhost:5000/api/users/${userId}`, {
				method: "DELETE",
				headers: { Authorization: `Bearer ${token}` },
			})
				.then((response) => {
					if (!response.ok) {
						throw new Error("Không thể xóa người dùng.");
					}
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
		<div className="user-management-container">
			<h1 className="user-management-title">Quản lý người dùng</h1>
			<table className="user-table">
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
								<button
									className="delete-button"
									onClick={() => handleDeleteUser(user.id)}
								>
									Xóa
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>

			<h2 className="add-user-title">Thêm người dùng mới</h2>
			<div className="add-user-form">
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
				<button className="add-user-button" onClick={handleAddUser}>
					Thêm người dùng
				</button>
			</div>
		</div>
	);
};

export default UserManagement;
