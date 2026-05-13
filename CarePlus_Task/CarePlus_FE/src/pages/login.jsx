import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Alert, message } from "antd";
import { LoadingOutlined, LockOutlined, LoginOutlined, UserOutlined } from "@ant-design/icons";
import { loginSuccess } from "../store/slices/authSlice";
import { loginApi } from "../util/api";

const initialForm = {
    login: "",
    password: "",
};

const getProfileRouteByRole = (role) => {
    return role === "admin" ? "/admin/profile" : "/user/profile";
};

const LoginPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [messageApi, contextHolder] = message.useMessage();
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [serverError, setServerError] = useState("");

    const isEmailLogin = useMemo(() => form.login.includes("@"), [form.login]);

    const validateForm = () => {
        const nextErrors = {};
        const normalizedLogin = form.login.trim();
        const normalizedPassword = form.password;

        if (!normalizedLogin) {
            nextErrors.login = "Vui lòng nhập username hoặc email.";
        } else if (normalizedLogin.includes("@") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedLogin)) {
            nextErrors.login = "Email đăng nhập không đúng định dạng.";
        }

        if (!normalizedPassword) {
            nextErrors.password = "Vui lòng nhập mật khẩu.";
        } else if (normalizedPassword.length < 6) {
            nextErrors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setServerError("");

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        setSubmitting(true);
        setServerError("");

        try {
            const payload = {
                login: form.login.trim(),
                password: form.password,
            };
            const response = await loginApi(payload);
            const data = response.data || {};
            const user = data.user || null;
            const redirectUrl = data.redirectUrl || getProfileRouteByRole(user?.role);

            if (!data.success || !data.token || !user) {
                throw new Error("Phản hồi đăng nhập không hợp lệ.");
            }

            dispatch(loginSuccess({ token: data.token, user }));
            messageApi.success(data.message || "Đăng nhập thành công.");
            navigate(redirectUrl, { replace: true });
        } catch (error) {
            const statusCode = error.response?.status;
            const nextMessage = error.response?.data?.message || error.message || "Đăng nhập thất bại.";
            setServerError(nextMessage);

            if (statusCode === 429) {
                messageApi.warning("Bạn đã vượt quá giới hạn thử đăng nhập. Vui lòng chờ rồi thử lại.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            {contextHolder}
            <section className="auth-shell">
                <div className="auth-panel auth-panel--hero">
                    <span className="auth-kicker">CarePlus Authentication</span>
                    <h1>Đăng nhập bằng JWT cho luồng client-server mới.</h1>
                    <p>
                        Phiên đăng nhập được xác thực ở backend, frontend lưu access token và điều hướng
                        tự động theo quyền `user` hoặc `admin`.
                    </p>
                    <ul className="auth-points">
                        <li>Validation ở cả client và server.</li>
                        <li>Rate limiting tại endpoint đăng nhập.</li>
                        <li>Authorization theo role và trả về URL profile phù hợp.</li>
                    </ul>
                </div>

                <div className="auth-panel auth-panel--form">
                    <div className="auth-card">
                        <div className="auth-card__header">
                            <h2>Đăng nhập</h2>
                            <p>Dùng username hoặc email để tiếp tục.</p>
                        </div>

                        {serverError && (
                            <Alert
                                type="error"
                                showIcon
                                className="auth-alert"
                                message={serverError}
                            />
                        )}

                        <form className="auth-form" onSubmit={handleSubmit} noValidate>
                            <div className="form-group">
                                <label htmlFor="login" className="form-label">Username hoặc Email</label>
                                <div className={`auth-input ${errors.login ? "auth-input--error" : ""}`}>
                                    <UserOutlined />
                                    <input
                                        id="login"
                                        name="login"
                                        type="text"
                                        autoComplete="username"
                                        placeholder="nhap username hoac email"
                                        value={form.login}
                                        onChange={handleChange}
                                    />
                                </div>
                                {errors.login && <p className="form-error">{errors.login}</p>}
                                {!errors.login && form.login && (
                                    <p className="form-hint">
                                        {isEmailLogin ? "Đang đăng nhập bằng email." : "Đang đăng nhập bằng username."}
                                    </p>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="password" className="form-label">Mật khẩu</label>
                                <div className={`auth-input ${errors.password ? "auth-input--error" : ""}`}>
                                    <LockOutlined />
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        placeholder="nhap mat khau"
                                        value={form.password}
                                        onChange={handleChange}
                                    />
                                </div>
                                {errors.password && <p className="form-error">{errors.password}</p>}
                            </div>

                            <button
                                type="submit"
                                className="btn btn--primary auth-submit"
                                disabled={submitting}
                            >
                                {submitting ? <LoadingOutlined /> : <LoginOutlined />}
                                {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
                            </button>
                        </form>

                        <p className="auth-card__footer">
                            <Link to="/forgot-password" style={{ display: 'block', marginBottom: '8px' }}>Quên mật khẩu?</Link>
                            Chưa có tài khoản? <Link to="/">Quay về trang chủ</Link>
                        </p>
                    </div>
                </div>
            </section>
        </>
    );
};

export default LoginPage;
