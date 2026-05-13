import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert, message } from "antd";
import {
    EyeInvisibleOutlined,
    EyeOutlined,
    LoadingOutlined,
    LockOutlined,
    MailOutlined,
    SafetyCertificateOutlined,
    SendOutlined,
    UserAddOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { registerApi, sendVerificationCodeApi } from "../util/api";

const MIN_PASSWORD_LENGTH = 6;
const VERIFICATION_CODE_LENGTH = 5;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_COOLDOWN_SECONDS = 60;

const initialForm = {
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    verificationCode: "",
};

const RegisterPage = () => {
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [serverSuccess, setServerSuccess] = useState("");
    const [sendingCode, setSendingCode] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [verificationRequested, setVerificationRequested] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        if (!cooldown) {
            return undefined;
        }

        const timer = window.setInterval(() => {
            setCooldown((prev) => {
                if (prev <= 1) {
                    window.clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => window.clearInterval(timer);
    }, [cooldown]);

    const lockedRegistrationFields = verificationRequested;
    const canResendCode = cooldown === 0 && !sendingCode;
    const verificationHint = useMemo(() => {
        if (!verificationRequested) {
            return "Nhập thông tin rồi bấm Nhận mã để khóa dữ liệu và gửi OTP về email.";
        }
        if (cooldown > 0) {
            return `Bạn có thể gửi lại mã sau ${cooldown}s.`;
        }
        return "Không thấy email? Bạn có thể gửi lại mã xác thực.";
    }, [cooldown, verificationRequested]);

    const validateForm = ({ requireVerificationCode = true } = {}) => {
        const nextErrors = {};
        const username = form.username.trim();
        const email = form.email.trim();
        const password = form.password;
        const confirmPassword = form.confirmPassword;
        const verificationCode = form.verificationCode.trim();

        if (!username) {
            nextErrors.username = "Vui lòng nhập username.";
        }

        if (!email) {
            nextErrors.email = "Vui lòng nhập email.";
        } else if (!EMAIL_REGEX.test(email)) {
            nextErrors.email = "Email không đúng định dạng.";
        }

        if (!password) {
            nextErrors.password = "Vui lòng nhập mật khẩu.";
        } else if (password.length < MIN_PASSWORD_LENGTH) {
            nextErrors.password = `Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự.`;
        }

        if (!confirmPassword) {
            nextErrors.confirmPassword = "Vui lòng xác nhận mật khẩu.";
        } else if (confirmPassword !== password) {
            nextErrors.confirmPassword = "Mật khẩu xác nhận không khớp.";
        }

        if (requireVerificationCode) {
            if (!verificationCode) {
                nextErrors.verificationCode = "Vui lòng nhập mã xác thực.";
            } else if (!new RegExp(`^\\d{${VERIFICATION_CODE_LENGTH}}$`).test(verificationCode)) {
                nextErrors.verificationCode = `Mã xác thực phải gồm ${VERIFICATION_CODE_LENGTH} chữ số.`;
            }
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        if (lockedRegistrationFields && ["username", "email", "password", "confirmPassword"].includes(name)) {
            return;
        }

        setForm((prev) => ({ ...prev, [name]: value }));
        setServerError("");
        setServerSuccess("");

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleSendCode = async () => {
        if (!validateForm({ requireVerificationCode: false })) {
            return;
        }

        setSendingCode(true);
        setServerError("");
        setServerSuccess("");

        try {
            const payload = {
                username: form.username.trim(),
                email: form.email.trim(),
            };
            const response = await sendVerificationCodeApi(payload);
            const data = response.data || {};

            if (!data.success) {
                throw new Error(data.message || "Không gửi được mã xác thực.");
            }

            setVerificationRequested(true);
            setCooldown(CODE_COOLDOWN_SECONDS);
            setServerSuccess(data.message || "Mã xác thực đã được gửi tới email của bạn.");
            messageApi.success(data.message || "Mã xác thực đã được gửi.");
        } catch (error) {
            const nextMessage = error.response?.data?.message || error.message || "Không gửi được mã xác thực.";
            setServerError(nextMessage);
        } finally {
            setSendingCode(false);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        setSubmitting(true);
        setServerError("");
        setServerSuccess("");

        try {
            const payload = {
                username: form.username.trim(),
                email: form.email.trim(),
                password: form.password,
                verificationCode: form.verificationCode.trim(),
            };
            const response = await registerApi(payload);
            const data = response.data || {};

            if (!data.success) {
                throw new Error(data.message || "Đăng ký thất bại.");
            }

            messageApi.success(data.message || "Đăng ký thành công.");
            setServerSuccess("Đăng ký thành công! Đang chuyển sang trang đăng nhập...");
            setForm(initialForm);
            setErrors({});
            setVerificationRequested(false);
            setCooldown(0);

            window.setTimeout(() => {
                navigate("/login", { replace: true });
            }, 1000);
        } catch (error) {
            const statusCode = error.response?.status;
            const nextMessage = error.response?.data?.message || error.message || "Đăng ký thất bại.";
            setServerError(nextMessage);

            if (statusCode === 410 || statusCode === 429) {
                setForm((prev) => ({ ...prev, verificationCode: "" }));
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            {contextHolder}
            <section className="auth-shell">
                <div className="auth-panel auth-panel--hero auth-panel--hero-register">
                    <span className="auth-kicker">CarePlus Registration</span>
                    <h1>Tạo tài khoản mới theo luồng React client-server.</h1>
                    <p>
                        Frontend gửi OTP bằng axios, giữ state cục bộ bằng hooks, và hoàn tất đăng ký
                        qua API thay cho form EJS server-rendered trước đây.
                    </p>
                    <ul className="auth-points">
                        <li>Khóa thông tin sau khi yêu cầu OTP để tránh lệch dữ liệu.</li>
                        <li>Hỗ trợ gửi lại mã sau thời gian chờ 60 giây.</li>
                        <li>Giữ validation đồng bộ với backend hiện tại.</li>
                    </ul>
                </div>

                <div className="auth-panel auth-panel--form">
                    <div className="auth-card">
                        <div className="auth-card__header">
                            <h2>Đăng ký</h2>
                            <p>Tạo tài khoản CarePlus bằng email xác thực.</p>
                        </div>

                        {serverError && (
                            <Alert type="error" showIcon className="auth-alert" message={serverError} />
                        )}

                        {!serverError && serverSuccess && (
                            <Alert type="success" showIcon className="auth-alert" message={serverSuccess} />
                        )}

                        <form className="auth-form" onSubmit={handleSubmit} noValidate>
                            <div className="form-group">
                                <label htmlFor="username" className="form-label">Username</label>
                                <div className={`auth-input ${errors.username ? "auth-input--error" : ""}`}>
                                    <UserOutlined />
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        autoComplete="username"
                                        placeholder="Nhập tên người dùng"
                                        value={form.username}
                                        onChange={handleChange}
                                        readOnly={lockedRegistrationFields}
                                    />
                                </div>
                                {errors.username && <p className="form-error">{errors.username}</p>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="email" className="form-label">Email</label>
                                <div className={`auth-input ${errors.email ? "auth-input--error" : ""}`}>
                                    <MailOutlined />
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        placeholder="Nhập Email"
                                        value={form.email}
                                        onChange={handleChange}
                                        readOnly={lockedRegistrationFields}
                                    />
                                </div>
                                {errors.email && <p className="form-error">{errors.email}</p>}
                            </div>

                            <div className="auth-form__row">
                                <div className="form-group">
                                    <label htmlFor="password" className="form-label">Mật khẩu</label>
                                    <div className={`auth-input ${errors.password ? "auth-input--error" : ""}`}>
                                        <LockOutlined />
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            autoComplete="new-password"
                                            placeholder="Nhập mật khẩu"
                                            value={form.password}
                                            onChange={handleChange}
                                            readOnly={lockedRegistrationFields}
                                        />
                                        <button
                                            type="button"
                                            className="auth-input__toggle"
                                            onClick={() => setShowPassword((prev) => !prev)}
                                            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                        >
                                            {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="form-error">{errors.password}</p>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="confirmPassword" className="form-label">Xác nhận mật khẩu</label>
                                    <div className={`auth-input ${errors.confirmPassword ? "auth-input--error" : ""}`}>
                                        <LockOutlined />
                                        <input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            autoComplete="new-password"
                                            placeholder="Nhập lại mật khẩu"
                                            value={form.confirmPassword}
                                            onChange={handleChange}
                                            readOnly={lockedRegistrationFields}
                                        />
                                        <button
                                            type="button"
                                            className="auth-input__toggle"
                                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                                            aria-label={showConfirmPassword ? "Ẩn xác nhận mật khẩu" : "Hiện xác nhận mật khẩu"}
                                        >
                                            {showConfirmPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="verificationCode" className="form-label">Mã xác thực</label>
                                <div className={`auth-input auth-input--action ${errors.verificationCode ? "auth-input--error" : ""}`}>
                                    <SafetyCertificateOutlined />
                                    <input
                                        id="verificationCode"
                                        name="verificationCode"
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={VERIFICATION_CODE_LENGTH}
                                        placeholder="Nhập mã OTP"
                                        value={form.verificationCode}
                                        onChange={handleChange}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn--outline btn--sm auth-inline-action"
                                        onClick={handleSendCode}
                                        disabled={!canResendCode}
                                    >
                                        {sendingCode ? <LoadingOutlined /> : <SendOutlined />}
                                        {sendingCode ? "Đang gửi..." : cooldown > 0 ? `Gửi lại (${cooldown}s)` : "Nhận mã"}
                                    </button>
                                </div>
                                {errors.verificationCode && <p className="form-error">{errors.verificationCode}</p>}
                                {!errors.verificationCode && <p className="form-hint">{verificationHint}</p>}
                            </div>

                            <button
                                type="submit"
                                className="btn btn--primary auth-submit"
                                disabled={submitting || sendingCode}
                            >
                                {submitting ? <LoadingOutlined /> : <UserAddOutlined />}
                                {submitting ? "Đang đăng ký..." : "Tạo tài khoản"}
                            </button>
                        </form>

                        <p className="auth-card__footer">
                            Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
                        </p>
                    </div>
                </div>
            </section>
        </>
    );
};

export default RegisterPage;
