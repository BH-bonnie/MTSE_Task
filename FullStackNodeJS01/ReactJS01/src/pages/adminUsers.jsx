import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    CloseOutlined,
    DeleteOutlined,
    EditOutlined,
    LoadingOutlined,
    PlusOutlined,
    ReloadOutlined,
    SaveOutlined,
    SearchOutlined,
    UsergroupAddOutlined,
} from "@ant-design/icons";
import { message } from "antd";
import {
    createUserApi,
    deleteUserApi,
    getAllUsers,
    getUserById,
    updateUserApi,
} from "../util/api";

const GENDER_OPTIONS = [
    { value: "", label: "Không xác định" },
    { value: "true", label: "Nam" },
    { value: "false", label: "Nữ" },
];

const ROLE_OPTIONS = [
    { value: "user", label: "user" },
    { value: "admin", label: "admin" },
];

const BOOLEAN_OPTIONS = [
    { value: "true", label: "Có" },
    { value: "false", label: "Không" },
];

const createEmptyForm = () => ({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    address: "",
    gender: "",
    phone: "",
    avatar: "",
    role: "user",
    isActive: "true",
    isLocked: "false",
});

const normalizeGender = (value) => {
    if (value === true || value === 1 || value === "1" || value === "true") return "true";
    if (value === false || value === 0 || value === "0" || value === "false") return "false";
    return "";
};

const getGenderLabel = (value) => {
    const normalized = normalizeGender(value);
    if (normalized === "true") return "Nam";
    if (normalized === "false") return "Nữ";
    return "—";
};

const formatDate = (value) => {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("vi-VN");
};

const getFullName = (user) => {
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
    return fullName || "—";
};

const AdminUsersPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, loading: authLoading, user: currentUser } = useSelector((state) => state.auth);
    const [messageApi, contextHolder] = message.useMessage();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [query, setQuery] = useState("");
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [mode, setMode] = useState("create");
    const [form, setForm] = useState(createEmptyForm);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate("/login", { replace: true });
            return;
        }

        if (!authLoading && isAuthenticated && currentUser?.role !== "admin") {
            navigate("/user/profile", { replace: true });
        }
    }, [authLoading, isAuthenticated, currentUser, navigate]);

    const loadUsers = async (nextSelectedUserId = selectedUserId) => {
        setLoading(true);
        try {
            const res = await getAllUsers();
            const nextUsers = res.data?.users || [];
            setUsers(nextUsers);

            if (nextSelectedUserId) {
                const stillExists = nextUsers.some((item) => String(item.id) === String(nextSelectedUserId));
                if (!stillExists) {
                    setSelectedUserId(null);
                    setMode("create");
                    setForm(createEmptyForm());
                }
            }
        } catch (error) {
            messageApi.error(error.response?.data?.message || "Không thể tải danh sách người dùng.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isAuthenticated || currentUser?.role !== "admin") {
            return;
        }

        loadUsers();
    }, [isAuthenticated, currentUser]);

    const filteredUsers = useMemo(() => {
        const keyword = query.trim().toLowerCase();
        if (!keyword) return users;

        return users.filter((entry) => {
            return [
                entry.username,
                entry.email,
                entry.firstName,
                entry.lastName,
                entry.phone,
                entry.role,
            ]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(keyword));
        });
    }, [users, query]);

    const resetForm = () => {
        setSelectedUserId(null);
        setMode("create");
        setForm(createEmptyForm());
        setErrors({});
    };

    const hydrateFormFromUser = (user) => {
        setForm({
            username: user.username || "",
            email: user.email || "",
            password: "",
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            address: user.address || "",
            gender: normalizeGender(user.gender),
            phone: user.phone || "",
            avatar: user.avatar || "",
            role: user.role || "user",
            isActive: String(user.isActive ?? true),
            isLocked: String(user.isLocked ?? false),
        });
    };

    const handleSelectUser = async (userId) => {
        setMode("edit");
        setSelectedUserId(userId);
        setErrors({});
        setSaving(true);
        try {
            const res = await getUserById(userId);
            const user = res.data?.user;
            if (!user) {
                throw new Error("Không tìm thấy thông tin người dùng.");
            }
            hydrateFormFromUser(user);
        } catch (error) {
            messageApi.error(error.response?.data?.message || error.message || "Không thể tải dữ liệu người dùng.");
        } finally {
            setSaving(false);
        }
    };

    const validateForm = () => {
        const nextErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!form.username.trim()) {
            nextErrors.username = "Username là bắt buộc.";
        }

        if (!form.email.trim()) {
            nextErrors.email = "Email là bắt buộc.";
        } else if (!emailRegex.test(form.email.trim())) {
            nextErrors.email = "Email không đúng định dạng.";
        }

        if (mode === "create" && !form.password) {
            nextErrors.password = "Mật khẩu là bắt buộc khi tạo user.";
        } else if (form.password && form.password.length < 6) {
            nextErrors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const buildPayload = () => {
        const payload = {
            username: form.username.trim(),
            email: form.email.trim(),
            firstName: form.firstName.trim() || "",
            lastName: form.lastName.trim() || "",
            address: form.address.trim() || "",
            gender: form.gender,
            phone: form.phone.trim() || "",
            avatar: form.avatar.trim() || "",
            role: form.role,
            isActive: form.isActive,
            isLocked: form.isLocked,
        };

        if (form.password) {
            payload.password = form.password;
        }

        return payload;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!validateForm()) {
            return;
        }

        setSaving(true);
        try {
            const payload = buildPayload();
            if (mode === "create") {
                await createUserApi(payload);
                messageApi.success("Tạo người dùng thành công.");
                resetForm();
                await loadUsers();
                return;
            }

            await updateUserApi(selectedUserId, payload);
            messageApi.success("Cập nhật người dùng thành công.");
            await loadUsers(selectedUserId);
        } catch (error) {
            messageApi.error(error.response?.data?.message || "Không thể lưu người dùng.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (userId) => {
        const targetUser = users.find((entry) => String(entry.id) === String(userId));
        const shouldDelete = window.confirm(
            `Xóa tài khoản ${targetUser?.username || targetUser?.email || `#${userId}`} ?`,
        );

        if (!shouldDelete) {
            return;
        }

        setDeletingId(userId);
        try {
            await deleteUserApi(userId);
            messageApi.success("Xóa người dùng thành công.");
            if (String(selectedUserId) === String(userId)) {
                resetForm();
            }
            await loadUsers();
        } catch (error) {
            messageApi.error(error.response?.data?.message || "Không thể xóa người dùng.");
        } finally {
            setDeletingId(null);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="profile-loading">
                <LoadingOutlined className="profile-loading__icon" />
                <span>Đang tải khu vực quản trị...</span>
            </div>
        );
    }

    return (
        <>
            {contextHolder}
            <section className="admin-users-page">
                <div className="admin-users-hero">
                    <div>
                        <span className="admin-users-hero__eyebrow">Admin Console</span>
                        <h1>Quản lý tất cả tài khoản người dùng</h1>
                        <p>
                            Xem danh sách, tạo mới, cập nhật và xóa tài khoản bằng API admin được bảo vệ
                            bởi JWT và phân quyền theo role.
                        </p>
                    </div>
                    <div className="admin-users-hero__actions">
                        <button className="btn btn--outline" type="button" onClick={() => loadUsers()}>
                            <ReloadOutlined /> Tải lại
                        </button>
                        <button className="btn btn--primary" type="button" onClick={resetForm}>
                            <PlusOutlined /> Tạo user mới
                        </button>
                    </div>
                </div>

                <div className="admin-users-layout">
                    <section className="admin-users-panel admin-users-panel--table">
                        <div className="admin-users-panel__header">
                            <div>
                                <h2>Danh sách user</h2>
                                <p>{filteredUsers.length} tài khoản hiển thị</p>
                            </div>
                            <label className="admin-users-search">
                                <SearchOutlined />
                                <input
                                    type="text"
                                    placeholder="Tìm username, email, vai trò..."
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                />
                            </label>
                        </div>

                        <div className="admin-users-table-wrap">
                            <table className="admin-users-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Username</th>
                                        <th>Email</th>
                                        <th>Họ tên</th>
                                        <th>Vai trò</th>
                                        <th>Trạng thái</th>
                                        <th>Phone</th>
                                        <th>Giới tính</th>
                                        <th>Ngày tạo</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {!filteredUsers.length && (
                                        <tr>
                                            <td colSpan="10" className="admin-users-empty">
                                                Không có người dùng phù hợp.
                                            </td>
                                        </tr>
                                    )}

                                    {filteredUsers.map((entry) => (
                                        <tr
                                            key={entry.id}
                                            className={String(selectedUserId) === String(entry.id) ? "is-selected" : ""}
                                        >
                                            <td>{entry.id}</td>
                                            <td>{entry.username || "—"}</td>
                                            <td>{entry.email || "—"}</td>
                                            <td>{getFullName(entry)}</td>
                                            <td>
                                                <span className={`role-pill role-pill--${entry.role || "user"}`}>
                                                    {entry.role || "user"}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={entry.isActive ? "status-dot active" : "status-dot inactive"}>
                                                    {entry.isActive ? "Hoạt động" : "Ngừng hoạt động"}
                                                </span>
                                                <span className={`status-tag ${entry.isLocked ? "locked" : "open"}`}>
                                                    {entry.isLocked ? "Đã khóa" : "Đang mở"}
                                                </span>
                                            </td>
                                            <td>{entry.phone || "—"}</td>
                                            <td>{getGenderLabel(entry.gender)}</td>
                                            <td>{formatDate(entry.createdAt)}</td>
                                            <td>
                                                <div className="admin-users-actions">
                                                    <button
                                                        type="button"
                                                        className="btn btn--ghost btn--sm"
                                                        onClick={() => handleSelectUser(entry.id)}
                                                    >
                                                        <EditOutlined /> Sửa
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn--ghost btn--sm admin-users-delete"
                                                        onClick={() => handleDelete(entry.id)}
                                                        disabled={deletingId === entry.id}
                                                    >
                                                        {deletingId === entry.id ? <LoadingOutlined /> : <DeleteOutlined />}
                                                        Xóa
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <aside className="admin-users-panel admin-users-panel--editor">
                        <div className="admin-users-panel__header">
                            <div>
                                <h2>{mode === "create" ? "Tạo người dùng" : `Chỉnh sửa #${selectedUserId}`}</h2>
                                <p>
                                    {mode === "create"
                                        ? "Tạo nhanh user mới trong hệ thống."
                                        : "Cập nhật thông tin, vai trò và trạng thái tài khoản."}
                                </p>
                            </div>
                            {mode === "edit" && (
                                <button className="btn btn--ghost btn--sm" type="button" onClick={resetForm}>
                                    <CloseOutlined /> Hủy chọn
                                </button>
                            )}
                        </div>

                        <form className="admin-users-form" onSubmit={handleSubmit}>
                            <div className="profile-form__row">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="admin-username">Tên đăng nhập</label>
                                    <input
                                        id="admin-username"
                                        name="username"
                                        className="form-input"
                                        value={form.username}
                                        onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
                                    />
                                    {errors.username && <p className="form-error">{errors.username}</p>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="admin-email">Email</label>
                                    <input
                                        id="admin-email"
                                        name="email"
                                        type="email"
                                        className="form-input"
                                        value={form.email}
                                        onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                                    />
                                    {errors.email && <p className="form-error">{errors.email}</p>}
                                </div>
                            </div>

                            <div className="profile-form__row">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="admin-password">
                                        {mode === "create" ? "Mật khẩu" : "Mật khẩu mới"}
                                    </label>
                                    <input
                                        id="admin-password"
                                        name="password"
                                        type="password"
                                        className="form-input"
                                        value={form.password}
                                        onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                                        placeholder={mode === "create" ? "Tối thiểu 6 ký tự" : "Bỏ trống nếu không đổi"}
                                    />
                                    {errors.password && <p className="form-error">{errors.password}</p>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="admin-role">Vai trò</label>
                                    <select
                                        id="admin-role"
                                        className="form-input form-select"
                                        value={form.role}
                                        onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
                                    >
                                        {ROLE_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="profile-form__row">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="admin-firstName">Họ</label>
                                    <input
                                        id="admin-firstName"
                                        className="form-input"
                                        value={form.firstName}
                                        onChange={(event) => setForm((prev) => ({ ...prev, firstName: event.target.value }))}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="admin-lastName">Tên</label>
                                    <input
                                        id="admin-lastName"
                                        className="form-input"
                                        value={form.lastName}
                                        onChange={(event) => setForm((prev) => ({ ...prev, lastName: event.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="profile-form__row">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="admin-phone">Số điện thoại</label>
                                    <input
                                        id="admin-phone"
                                        className="form-input"
                                        value={form.phone}
                                        onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="admin-gender">Giới tính</label>
                                    <select
                                        id="admin-gender"
                                        className="form-input form-select"
                                        value={form.gender}
                                        onChange={(event) => setForm((prev) => ({ ...prev, gender: event.target.value }))}
                                    >
                                        {GENDER_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group form-group--full">
                                <label className="form-label" htmlFor="admin-address">Địa chỉ</label>
                                <input
                                    id="admin-address"
                                    className="form-input"
                                    value={form.address}
                                    onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
                                />
                            </div>

                            <div className="form-group form-group--full">
                                <label className="form-label" htmlFor="admin-avatar">URL Avatar</label>
                                <input
                                    id="admin-avatar"
                                    className="form-input"
                                    value={form.avatar}
                                    onChange={(event) => setForm((prev) => ({ ...prev, avatar: event.target.value }))}
                                />
                            </div>

                            <div className="profile-form__row">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="admin-active">Trạng thái active</label>
                                    <select
                                        id="admin-active"
                                        className="form-input form-select"
                                        value={form.isActive}
                                        onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.value }))}
                                    >
                                        {BOOLEAN_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="admin-locked">Khóa tài khoản</label>
                                    <select
                                        id="admin-locked"
                                        className="form-input form-select"
                                        value={form.isLocked}
                                        onChange={(event) => setForm((prev) => ({ ...prev, isLocked: event.target.value }))}
                                    >
                                        {BOOLEAN_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="admin-users-form__footer">
                                <button className="btn btn--ghost" type="button" onClick={resetForm} disabled={saving}>
                                    <ReloadOutlined /> Đặt lại
                                </button>
                                <button className="btn btn--primary" type="submit" disabled={saving}>
                                    {saving ? <LoadingOutlined /> : mode === "create" ? <UsergroupAddOutlined /> : <SaveOutlined />}
                                    {mode === "create" ? "Tạo user" : "Lưu thay đổi"}
                                </button>
                            </div>
                        </form>
                    </aside>
                </div>
            </section>
        </>
    );
};

export default AdminUsersPage;
