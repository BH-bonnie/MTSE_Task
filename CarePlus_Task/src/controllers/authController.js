import authService from "../services/authService";
import CRUDService from "../services/CRUDService";

const { sendOTPEmail } = require("../utils/emailSender");

let getLoginPage = (req, res) => {
    return res.render("login.ejs");
};

let getRegisterPage = (req, res) => {
    return res.render("register.ejs");
};

let login = async (req, res) => {
    try {
        const result = await authService.loginUser({
            login: req.body.login,
            password: req.body.password,
        });
        return res.status(200).json(result);
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Đăng nhập thất bại",
        });
    }
};

let getCurrentSession = async (req, res) => {
    try {
        const user = await authService.getCurrentUser(req.user.id);
        return res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Không thể lấy thông tin phiên đăng nhập",
        });
    }
};

let sendVerificationCode = async (req, res) => {
    try {
        const { email, username } = req.body;
        const result = await authService.sendVerificationCode(email, username);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Không gửi được mã xác thực",
        });
    }
};

let register = async (req, res) => {
    try {
        const { username, email, password, verificationCode } = req.body;
        const result = await authService.registerUser({ username, email, password, verificationCode });
        return res.status(200).json(result);
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Đăng ký thất bại",
        });
    }
};

let getForgotPasswordPage = (req, res) => {
    return res.render("forgotPassword.ejs");
};

let postForgotPassword = async (req, res) => {
    const email = (req.body.email || "").trim();

    try {
        const user = await CRUDService.getUserInfoByEmail(email);
        if (!user) {
            return res.render("forgotPassword.ejs", { error: "Email không tồn tại" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await CRUDService.updateUserOTP(email, otp, expiresAt);
        await sendOTPEmail(email, otp);

        return res.render("resetPassword.ejs", { email });
    } catch (error) {
        return res.render("forgotPassword.ejs", {
            error: "Không thể gửi email lúc này. Vui lòng thử lại sau.",
        });
    }
};

let getResetPasswordPage = (req, res) => {
    return res.render("resetPassword.ejs", {
        email: (req.query.email || "").trim(),
    });
};

let postResetPassword = async (req, res) => {
    const email = (req.body.email || "").trim();
    const otp = (req.body.otp || "").trim();
    const newPassword = req.body.newPassword || "";
    const confirmPassword = req.body.confirmPassword || "";

    try {
        const user = await CRUDService.getUserInfoByEmail(email);
        if (!user) {
            return res.render("resetPassword.ejs", {
                error: "Email không tồn tại",
                email,
            });
        }

        if (!otp || user.otpCode !== otp || !user.otpExpiresAt || new Date(user.otpExpiresAt) < new Date()) {
            return res.render("resetPassword.ejs", {
                error: "OTP không hợp lệ hoặc đã hết hạn",
                email,
            });
        }

        if (!newPassword || newPassword.length < 6) {
            return res.render("resetPassword.ejs", {
                error: "Mật khẩu mới phải có ít nhất 6 ký tự",
                email,
            });
        }

        if (newPassword !== confirmPassword) {
            return res.render("resetPassword.ejs", {
                error: "Mật khẩu xác nhận không khớp",
                email,
            });
        }

        await CRUDService.updateUserPasswordAndVerify(email, newPassword);
        return res.redirect("/login");
    } catch (error) {
        return res.status(500).send("Lỗi máy chủ");
    }
};

module.exports = {
    getLoginPage,
    getRegisterPage,
    login,
    getCurrentSession,
    sendVerificationCode,
    register,
    getForgotPasswordPage,
    postForgotPassword,
    getResetPasswordPage,
    postResetPassword,
};
