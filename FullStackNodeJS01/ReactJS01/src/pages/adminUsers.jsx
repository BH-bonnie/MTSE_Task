import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    Users, Search, Plus, Trash2, Edit, AlertCircle, RefreshCw, X, Save, UserPlus
} from "lucide-react";
import { message } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import {
    createUserApi,
    deleteUserApi,
    getAllUsers,
    getUserById,
    updateUserApi,
} from "../util/api";

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

const getFullName = (user) => {
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
    return fullName || user.name || "—";
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
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
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

    const loadUsers = async () => {
        setLoading(true);
        try {
            const res = await getAllUsers();
            setUsers(res.data?.users || []);
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
                entry.name,
                entry.firstName,
                entry.lastName,
                entry.phone,
                entry.role,
            ]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(keyword));
        });
    }, [users, query]);

    const handleCreateNew = () => {
        setSelectedUserId(null);
        setMode("create");
        setForm(createEmptyForm());
        setErrors({});
        setIsModalOpen(true);
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
        setIsModalOpen(true);
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
            setIsModalOpen(false);
        } finally {
            setSaving(false);
        }
    };

    const validateForm = () => {
        const nextErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!form.username?.trim()) {
            nextErrors.username = "Username là bắt buộc.";
        }

        if (!form.email?.trim()) {
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
            username: form.username?.trim() || "",
            email: form.email?.trim() || "",
            firstName: form.firstName?.trim() || "",
            lastName: form.lastName?.trim() || "",
            address: form.address?.trim() || "",
            gender: form.gender,
            phone: form.phone?.trim() || "",
            avatar: form.avatar?.trim() || "",
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
                setIsModalOpen(false);
                await loadUsers();
                return;
            }

            await updateUserApi(selectedUserId, payload);
            messageApi.success("Cập nhật người dùng thành công.");
            setIsModalOpen(false);
            await loadUsers();
        } catch (error) {
            messageApi.error(error.response?.data?.message || "Không thể lưu người dùng.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (userId) => {
        const targetUser = users.find((entry) => String(entry.id) === String(userId));
        const shouldDelete = window.confirm(
            `Xóa tài khoản ${targetUser?.username || targetUser?.email || `#${userId}`} ?`
        );

        if (!shouldDelete) {
            return;
        }

        setDeletingId(userId);
        try {
            await deleteUserApi(userId);
            messageApi.success("Xóa người dùng thành công.");
            if (String(selectedUserId) === String(userId)) {
                setIsModalOpen(false);
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
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-500 font-bold text-sm">Đang tải khu vực quản trị...</span>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-8">
            {contextHolder}
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-800 tracking-tight flex items-center gap-2">
                        <Users className="h-8 w-8 text-orange-500" /> Quản Lý Người Dùng
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Xem danh sách, tạo mới, cập nhật và xóa tài khoản bằng API admin.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => loadUsers()}
                        className="px-5 py-3.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-black text-sm rounded-2xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                    >
                        <RefreshCw className="h-4 w-4" /> Tải lại
                    </button>
                    <button 
                        onClick={handleCreateNew}
                        className="px-5 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-black text-sm rounded-2xl transition-all shadow-lg shadow-orange-100 flex items-center gap-2 cursor-pointer"
                    >
                        <Plus className="h-4 w-4" /> Tạo user mới
                    </button>
                </div>
            </div>

            {/* Main Content (Table Only) */}
            <div className="space-y-6">
                {/* Search */}
                <div className="relative max-w-md">
                    <input
                        type="text"
                        placeholder="Tìm username, email, vai trò..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full bg-white border border-gray-150 rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm font-bold text-gray-800 shadow-sm"
                    />
                    <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                </div>

                {/* Table */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50 text-[10px] font-black uppercase text-gray-400 tracking-wider">
                                    <th className="py-4 px-6">ID</th>
                                    <th className="py-4 px-6">Thông tin</th>
                                    <th className="py-4 px-6">Vai trò</th>
                                    <th className="py-4 px-6">Trạng thái</th>
                                    <th className="py-4 px-6 text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm font-bold text-gray-700">
                                {filteredUsers.map((entry) => (
                                    <tr key={entry.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 px-6 text-xs text-gray-400 uppercase tracking-widest">
                                            #{entry.id?.substring(entry.id.length - 6) || entry.id}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0 border border-gray-200">
                                                    {entry.avatar ? (
                                                        <img src={entry.avatar} alt="avatar" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Users className="h-5 w-5 text-gray-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-gray-900 font-black">{entry.username || getFullName(entry) || "—"}</p>
                                                    <p className="text-xs text-gray-500 font-medium">{entry.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${entry.role === 'admin' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                                {entry.role || "user"}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col gap-1.5 items-start">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5 ${entry.isActive ? 'text-green-600 bg-green-50' : 'text-gray-500 bg-gray-100'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${entry.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                                    {entry.isActive ? "Hoạt động" : "Ngừng HĐ"}
                                                </span>
                                                {entry.isLocked && (
                                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-red-50 text-red-600 border border-red-100">Đã khóa</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex gap-2 justify-center">
                                                <button 
                                                    onClick={() => handleSelectUser(entry.id)}
                                                    className="p-2 border border-gray-150 hover:border-orange-500 rounded-xl hover:bg-orange-50 text-gray-400 hover:text-orange-500 transition-colors cursor-pointer"
                                                    title="Sửa"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(entry.id)}
                                                    disabled={deletingId === entry.id}
                                                    className="p-2 border border-gray-150 hover:border-red-500 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors cursor-pointer disabled:opacity-50"
                                                    title="Xóa"
                                                >
                                                    {deletingId === entry.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="py-12 text-center">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Users className="h-8 w-8 text-gray-300" />
                                            </div>
                                            <h3 className="text-lg font-black text-gray-800">Không tìm thấy người dùng</h3>
                                            <p className="text-gray-500 text-sm mt-1">Hãy thử với từ khóa khác.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Form */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-3xl p-8 max-w-2xl w-full border border-gray-100 shadow-2xl my-auto"
                        >
                            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
                                        {mode === "create" ? <UserPlus className="h-6 w-6 text-orange-500" /> : <Edit className="h-6 w-6 text-orange-500" />}
                                        {mode === "create" ? "Tạo người dùng mới" : "Chỉnh sửa tài khoản"}
                                    </h2>
                                    <p className="text-xs text-gray-500 font-medium mt-1">
                                        {mode === "create" ? "Điền đầy đủ thông tin bên dưới để tạo tài khoản" : `ID: #${selectedUserId?.substring(selectedUserId.length - 6) || selectedUserId}`}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setIsModalOpen(false)} 
                                    className="p-2 text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-1">
                                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">Tên đăng nhập *</label>
                                        <input
                                            type="text"
                                            value={form.username}
                                            onChange={(e) => setForm(p => ({ ...p, username: e.target.value }))}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-sm font-bold text-gray-800"
                                        />
                                        {errors.username && <p className="text-red-500 text-xs mt-1 font-medium">{errors.username}</p>}
                                    </div>
                                    
                                    <div className="md:col-span-1">
                                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">Email *</label>
                                        <input
                                            type="email"
                                            value={form.email}
                                            onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-sm font-bold text-gray-800"
                                        />
                                        {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email}</p>}
                                    </div>

                                    <div className="md:col-span-1">
                                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">Họ</label>
                                        <input
                                            type="text"
                                            value={form.firstName}
                                            onChange={(e) => setForm(p => ({ ...p, firstName: e.target.value }))}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-sm font-bold text-gray-800"
                                        />
                                    </div>

                                    <div className="md:col-span-1">
                                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">Tên</label>
                                        <input
                                            type="text"
                                            value={form.lastName}
                                            onChange={(e) => setForm(p => ({ ...p, lastName: e.target.value }))}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-sm font-bold text-gray-800"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">
                                            {mode === "create" ? "Mật khẩu *" : "Mật khẩu mới (Tùy chọn)"}
                                        </label>
                                        <input
                                            type="password"
                                            value={form.password}
                                            onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
                                            placeholder={mode === "create" ? "Tối thiểu 6 ký tự" : "Bỏ trống nếu không đổi"}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-sm font-bold text-gray-800"
                                        />
                                        {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password}</p>}
                                    </div>

                                    <div className="md:col-span-1">
                                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">Điện thoại</label>
                                        <input
                                            type="text"
                                            value={form.phone}
                                            onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-sm font-bold text-gray-800"
                                        />
                                    </div>

                                    <div className="md:col-span-1">
                                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">Giới tính</label>
                                        <select
                                            value={form.gender}
                                            onChange={(e) => setForm(p => ({ ...p, gender: e.target.value }))}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-sm font-bold text-gray-800"
                                        >
                                            <option value="">Không XĐ</option>
                                            <option value="true">Nam</option>
                                            <option value="false">Nữ</option>
                                        </select>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">Địa chỉ</label>
                                        <input
                                            type="text"
                                            value={form.address}
                                            onChange={(e) => setForm(p => ({ ...p, address: e.target.value }))}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-sm font-bold text-gray-800"
                                        />
                                    </div>
                                    
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">URL Avatar</label>
                                        <input
                                            type="text"
                                            value={form.avatar}
                                            onChange={(e) => setForm(p => ({ ...p, avatar: e.target.value }))}
                                            placeholder="https://..."
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-sm font-bold text-gray-800"
                                        />
                                    </div>

                                    <div className="md:col-span-1">
                                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">Vai trò</label>
                                        <select
                                            value={form.role}
                                            onChange={(e) => setForm(p => ({ ...p, role: e.target.value }))}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-sm font-bold text-gray-800"
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>

                                    <div className="md:col-span-1">
                                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">Trạng thái</label>
                                        <select
                                            value={form.isActive}
                                            onChange={(e) => setForm(p => ({ ...p, isActive: e.target.value }))}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-sm font-bold text-gray-800"
                                        >
                                            <option value="true">Hoạt động</option>
                                            <option value="false">Ngừng HĐ</option>
                                        </select>
                                    </div>
                                    
                                    <div className="md:col-span-2 mt-2">
                                        <label className="flex items-center gap-2 cursor-pointer p-3 bg-red-50 border border-red-100 rounded-xl">
                                            <input 
                                                type="checkbox" 
                                                checked={form.isLocked === "true"} 
                                                onChange={(e) => setForm(p => ({ ...p, isLocked: e.target.checked ? "true" : "false" }))}
                                                className="w-5 h-5 text-red-500 rounded border-red-300 focus:ring-red-500"
                                            />
                                            <span className="text-sm font-black text-red-700 uppercase tracking-wide">Khóa tài khoản (Cấm đăng nhập)</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="pt-6 mt-6 border-t border-gray-100 flex gap-3 justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        disabled={saving}
                                        className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black text-sm rounded-xl transition-all cursor-pointer"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-black text-sm rounded-xl shadow-lg shadow-orange-100 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 min-w-[160px]"
                                    >
                                        {saving ? (
                                            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                        ) : mode === "create" ? (
                                            <><UserPlus className="h-4 w-4" /> Tạo tài khoản</>
                                        ) : (
                                            <><Save className="h-4 w-4" /> Lưu thay đổi</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminUsersPage;
