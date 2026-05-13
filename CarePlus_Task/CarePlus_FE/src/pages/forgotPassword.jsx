import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert, message } from "antd";
import { LoadingOutlined, MailOutlined, SafetyCertificateOutlined, LockOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { forgotPasswordApi, resetPasswordApi } from "../util/api";

const initialForm = {
    email: "",
    otpCode: "",
    newPassword: "",
    confirmPassword: "",
};

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [serverError, setServerError] = useState("");
    const [step, setStep] = useState(1); // 1: Yêu cầu OTP, 2: Nhập OTP và mật khẩu mới

    const validateStep1 = () => {
        const nextErrors = {};
        const normalizedEmail = form.email.trim();

        if (!normalizedEmail) {
            nextErrors.email = "Vui lòng nhập email.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            nextErrors.email = "Email không đúng định dạng.";
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const validateStep2 = () => {
        const nextErrors = {};
        
        if (!form.otpCode.trim()) {
            nextErrors.otpCode = "Vui lòng nhập mã OTP.";
        } else if (!/^\d{5}$/.test(form.otpCode.trim())) {
            nextErrors.otpCode = "Mã OTP phải gồm 5 chữ số.";
        }

        if (!form.newPassword) {
            nextErrors.newPassword = "Vui lòng nhập mật khẩu mới.";
        } else if (form.newPassword.length < 6) {
            nextErrors.newPassword = "Mật khẩu phải có ít nhất 6 ký tự.";
        }

        if (form.newPassword !== form.confirmPassword) {
            nextErrors.confirmPassword = "Mật khẩu xác nhận không khớp.";
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

    const handleSendOTP = async (event) => {
        event.preventDefault();

        if (!validateStep1()) {
            return;
        }

        setSubmitting(true);
        setServerError("");

        try {
            const payload = {
                email: form.email.trim(),
            };
            const response = await forgotPasswordApi(payload);
            const data = response.data || {};

            if (!data.success) {
                throw new Error("Không thể gửi mã xác thực.");
            }

            messageApi.success(data.message || "Mã OTP đã được gửi đến email.");
            setStep(2);
        } catch (error) {
            const nextMessage = error.response?.data?.message || error.message || "Gửi mã xác thực thất bại.";
            setServerError(nextMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const handleResetPassword = async (event) => {
        event.preventDefault();

        if (!validateStep2()) {
            return;
        }

        setSubmitting(true);
        setServerError("");

        try {
            const payload = {
                email: form.email.trim(),
                otpCode: form.otpCode.trim(),
                newPassword: form.newPassword,
            };
            const response = await resetPasswordApi(payload);
            const data = response.data || {};

            if (!data.success) {
                throw new Error("Không thể khôi phục mật khẩu.");
            }

            messageApi.success(data.message || "Khôi phục mật khẩu thành công!");
            navigate("/login", { replace: true });
        } catch (error) {
            const nextMessage = error.response?.data?.message || error.message || "Khôi phục mật khẩu thất bại.";
            setServerError(nextMessage);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            {contextHolder}
            <section className="auth-shell">
                <div className="auth-panel auth-panel--hero">
                    <span className="auth-kicker">CarePlus Security</span>
                    <h1>Khôi phục mật khẩu tài khoản CarePlus.</h1>
                    <p>
                        Luồng quên mật khẩu sử dụng mã OTP gửi qua email. Mật khẩu mới sẽ được bảo mật tuyệt đối.
                    </p>
                    <ul className="auth-points">
                        <li>Bảo mật mã hóa mật khẩu bcrypt.</li>
                        <li>OTP có giới hạn thời gian và số lần thử.</li>
                        <li>Giao diện React hiện đại.</li>
                    </ul>
                </div>

                <div className="auth-panel auth-panel--form">
                    <div className="auth-card">
                        <div className="auth-card__header">
                            <h2>Khôi phục mật khẩu</h2>
                            <p>{step === 1 ? "Nhập email của bạn để nhận mã xác thực OTP." : "Nhập mã OTP và mật khẩu mới để hoàn tất."}</p>
                        </div>

                        {serverError && (
                            <Alert
                                type="error"
                                showIcon
                                className="auth-alert"
                                message={serverError}
                            />
                        )}

                        {step === 1 ? (
                            <form className="auth-form" onSubmit={handleSendOTP} noValidate>
                                <div className="form-group">
                                    <label htmlFor="email" className="form-label">Email</label>
                                    <div className={`auth-input ${errors.email ? "auth-input--error" : ""}`}>
                                        <MailOutlined />
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            placeholder="Nhập email của bạn"
                                            value={form.email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    {errors.email && <p className="form-error">{errors.email}</p>}
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn--primary auth-submit"
                                    disabled={submitting}
                                >
                                    {submitting ? <LoadingOutlined /> : <CheckCircleOutlined />}
                                    {submitting ? "Đang gửi OTP..." : "Gửi mã OTP"}
                                </button>
                            </form>
                        ) : (
                            <form className="auth-form" onSubmit={handleResetPassword} noValidate>
                                <div className="form-group">
                                    <label htmlFor="otpCode" className="form-label">Mã OTP</label>
                                    <div className={`auth-input ${errors.otpCode ? "auth-input--error" : ""}`}>
                                        <SafetyCertificateOutlined />
                                        <input
                                            id="otpCode"
                                            name="otpCode"
                                            type="text"
                                            maxLength={5}
                                            placeholder="Nhập mã OTP 5 số"
                                            value={form.otpCode}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    {errors.otpCode && <p className="form-error">{errors.otpCode}</p>}
                                    <p className="form-hint" style={{ marginTop: "4px", cursor: "pointer", color: "var(--color-primary-base)" }} onClick={() => setStep(1)}>
                                        Nhập lại email?
                                    </p>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="newPassword" className="form-label">Mật khẩu mới</label>
                                    <div className={`auth-input ${errors.newPassword ? "auth-input--error" : ""}`}>
                                        <LockOutlined />
                                        <input
                                            id="newPassword"
                                            name="newPassword"
                                            type="password"
                                            placeholder="Nhập mật khẩu mới"
                                            value={form.newPassword}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    {errors.newPassword && <p className="form-error">{errors.newPassword}</p>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="confirmPassword" className="form-label">Xác nhận mật khẩu mới</label>
                                    <div className={`auth-input ${errors.confirmPassword ? "auth-input--error" : ""}`}>
                                        <LockOutlined />
                                        <input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type="password"
                                            placeholder="Xác nhận mật khẩu mới"
                                            value={form.confirmPassword}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn--primary auth-submit"
                                    disabled={submitting}
                                >
                                    {submitting ? <LoadingOutlined /> : <CheckCircleOutlined />}
                                    {submitting ? "Đang xử lý..." : "Khôi phục mật khẩu"}
                                </button>
                            </form>
                        )}

                        <p className="auth-card__footer">
                            Đã nhớ lại mật khẩu? <Link to="/login">Đăng nhập</Link>
                        </p>
                    </div>
                </div>
            </section>
        </>
    );
};

export default ForgotPasswordPage;
