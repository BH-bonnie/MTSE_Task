import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { updateProfile } from "../store/slices/authSlice";
import { getMyProfile, updateMyProfile } from "../util/api";
import { UserOutlined, EditOutlined, SaveOutlined, CloseOutlined, LoadingOutlined } from "@ant-design/icons";
import { message } from "antd";

const GENDER_OPTIONS = [
    { value: "", label: "Không xác định" },
    { value: "true", label: "Nam" },
    { value: "false", label: "Nữ" },
];

const normalizeGenderValue = (value) => {
    if (value === true || value === 1 || value === "1" || value === "true") {
        return true;
    }

    if (value === false || value === 0 || value === "0" || value === "false") {
        return false;
    }

    return null;
};

const getGenderSelectValue = (value) => {
    const normalized = normalizeGenderValue(value);
    if (normalized === true) return "true";
    if (normalized === false) return "false";
    return "";
};

const UserProfilePage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // ── Đọc auth state từ Redux store ────────────────────────────────────────
    const { isAuthenticated, loading: authLoading } = useSelector((state) => state.auth);

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        address: "",
        gender: "",
        avatar: "",
    });

    // ── Redirect nếu chưa đăng nhập ──────────────────────────────────────────
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate("/login", { replace: true });
        }
    }, [authLoading, isAuthenticated, navigate]);

    // ── Fetch profile từ API ──────────────────────────────────────────────────
    useEffect(() => {
        if (!isAuthenticated) return;

        setLoading(true);
        getMyProfile()
            .then((res) => {
                if (res.data?.success && res.data?.user) {
                    const u = res.data.user;
                    setProfile(u);
                    setForm({
                        firstName: u.firstName || "",
                        lastName: u.lastName || "",
                        phone: u.phone || "",
                        address: u.address || "",
                        gender: getGenderSelectValue(u.gender),
                        avatar: u.avatar || "",
                    });
                }
            })
            .catch(() => {
                messageApi.error("Không thể tải thông tin profile");
            })
            .finally(() => setLoading(false));
    }, [isAuthenticated]);

    // ── Xử lý form ────────────────────────────────────────────────────────────
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleCancelEdit = () => {
        if (!profile) return;
        setForm({
            firstName: profile.firstName || "",
            lastName: profile.lastName || "",
            phone: profile.phone || "",
            address: profile.address || "",
            gender: getGenderSelectValue(profile.gender),
            avatar: profile.avatar || "",
        });
        setIsEditing(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                firstName: form.firstName || null,
                lastName: form.lastName || null,
                phone: form.phone || null,
                address: form.address || null,
                gender: form.gender === "" ? null : form.gender,
                avatar: form.avatar || null,
            };

            const res = await updateMyProfile(payload);
            if (res.data?.success) {
                const updated = res.data.user;
                setProfile(updated);

                // ── Dispatch Redux action để cập nhật store ──────────────────
                dispatch(updateProfile(updated));

                messageApi.success("Cập nhật profile thành công!");
                setIsEditing(false);
            }
        } catch (err) {
            const msg = err.response?.data?.message || "Cập nhật thất bại. Vui lòng thử lại.";
            messageApi.error(msg);
        } finally {
            setSaving(false);
        }
    };

    // ── Render helpers ─────────────────────────────────────────────────────────
    const getAvatarUrl = () => profile?.avatar || null;

    const getDisplayName = () => {
        if (!profile) return "Người dùng";
        const full = [profile.firstName, profile.lastName].filter(Boolean).join(" ");
        return full || profile.username || "Người dùng";
    };

    const getGenderLabel = (g) => {
        const normalized = normalizeGenderValue(g);
        if (normalized === true) return "Nam";
        if (normalized === false) return "Nữ";
        return "Không xác định";
    };

    // ── Loading state ─────────────────────────────────────────────────────────
    if (authLoading || loading) {
        return (
            <div className="profile-loading">
                <LoadingOutlined className="profile-loading__icon" />
                <span>Đang tải thông tin...</span>
            </div>
        );
    }

    return (
        <>
            {contextHolder}
            <div className="profile-page">
                {/* ── Sidebar / Avatar ── */}
                <aside className="profile-sidebar">
                    <div className="profile-avatar">
                        {getAvatarUrl() ? (
                            <img src={getAvatarUrl()} alt="Avatar" className="profile-avatar__img" />
                        ) : (
                            <div className="profile-avatar__placeholder">
                                <UserOutlined />
                            </div>
                        )}
                    </div>
                    <h2 className="profile-sidebar__name">{getDisplayName()}</h2>
                    <span className="profile-sidebar__role">
                        {profile?.role === "admin" ? "Quản trị viên" : "Người dùng"}
                    </span>
                    <span className={`profile-sidebar__status ${profile?.isActive ? "active" : "inactive"}`}>
                        {profile?.isActive ? "● Hoạt động" : "● Không hoạt động"}
                    </span>
                    <p className="profile-sidebar__email">{profile?.email}</p>
                    <p className="profile-sidebar__username">@{profile?.username}</p>
                </aside>

                {/* ── Main Content ── */}
                <main className="profile-main">
                    <div className="profile-card">
                        <div className="profile-card__header">
                            <h1 className="profile-card__title">Thông tin cá nhân</h1>
                            {!isEditing && (
                                <button
                                    id="btn-edit-profile"
                                    className="btn btn--outline"
                                    onClick={() => setIsEditing(true)}
                                >
                                    <EditOutlined /> Chỉnh sửa
                                </button>
                            )}
                        </div>

                        {/* ── View mode ── */}
                        {!isEditing && (
                            <div className="profile-info">
                                <div className="profile-info__row">
                                    <span className="profile-info__label">Họ</span>
                                    <span className="profile-info__value">
                                        {profile?.firstName || <em className="muted">Chưa cập nhật</em>}
                                    </span>
                                </div>
                                <div className="profile-info__row">
                                    <span className="profile-info__label">Tên</span>
                                    <span className="profile-info__value">
                                        {profile?.lastName || <em className="muted">Chưa cập nhật</em>}
                                    </span>
                                </div>
                                <div className="profile-info__row">
                                    <span className="profile-info__label">Số điện thoại</span>
                                    <span className="profile-info__value">
                                        {profile?.phone || <em className="muted">Chưa cập nhật</em>}
                                    </span>
                                </div>
                                <div className="profile-info__row">
                                    <span className="profile-info__label">Địa chỉ</span>
                                    <span className="profile-info__value">
                                        {profile?.address || <em className="muted">Chưa cập nhật</em>}
                                    </span>
                                </div>
                                <div className="profile-info__row">
                                    <span className="profile-info__label">Giới tính</span>
                                    <span className="profile-info__value">{getGenderLabel(profile?.gender)}</span>
                                </div>
                                <div className="profile-info__row">
                                    <span className="profile-info__label">Link Avatar</span>
                                    <span className="profile-info__value profile-info__value--url">
                                        {profile?.avatar || <em className="muted">Chưa cập nhật</em>}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* ── Edit mode ── */}
                        {isEditing && (
                            <form id="form-edit-profile" className="profile-form" onSubmit={handleSave}>
                                <div className="profile-form__row">
                                    <div className="form-group">
                                        <label htmlFor="firstName" className="form-label">Họ</label>
                                        <input
                                            id="firstName"
                                            name="firstName"
                                            type="text"
                                            className="form-input"
                                            placeholder="Nhập họ"
                                            value={form.firstName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="lastName" className="form-label">Tên</label>
                                        <input
                                            id="lastName"
                                            name="lastName"
                                            type="text"
                                            className="form-input"
                                            placeholder="Nhập tên"
                                            value={form.lastName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="profile-form__row">
                                    <div className="form-group">
                                        <label htmlFor="phone" className="form-label">Số điện thoại</label>
                                        <input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            className="form-input"
                                            placeholder="Nhập số điện thoại"
                                            value={form.phone}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="gender" className="form-label">Giới tính</label>
                                        <select
                                            id="gender"
                                            name="gender"
                                            className="form-input form-select"
                                            value={form.gender}
                                            onChange={handleChange}
                                        >
                                            {GENDER_OPTIONS.map((opt) => (
                                                <option key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group form-group--full">
                                    <label htmlFor="address" className="form-label">Địa chỉ</label>
                                    <input
                                        id="address"
                                        name="address"
                                        type="text"
                                        className="form-input"
                                        placeholder="Nhập địa chỉ"
                                        value={form.address}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group form-group--full">
                                    <label htmlFor="avatar" className="form-label">URL Avatar</label>
                                    <input
                                        id="avatar"
                                        name="avatar"
                                        type="url"
                                        className="form-input"
                                        placeholder="https://example.com/avatar.jpg"
                                        value={form.avatar}
                                        onChange={handleChange}
                                    />
                                    {form.avatar && (
                                        <div className="avatar-preview">
                                            <img
                                                src={form.avatar}
                                                alt="Preview"
                                                onError={(e) => { e.target.style.display = "none"; }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="profile-form__actions">
                                    <button
                                        type="button"
                                        id="btn-cancel-edit"
                                        className="btn btn--ghost"
                                        onClick={handleCancelEdit}
                                        disabled={saving}
                                    >
                                        <CloseOutlined /> Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        id="btn-save-profile"
                                        className="btn btn--primary"
                                        disabled={saving}
                                    >
                                        {saving ? <LoadingOutlined /> : <SaveOutlined />}
                                        {saving ? "Đang lưu..." : "Lưu thay đổi"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
};

export default UserProfilePage;
