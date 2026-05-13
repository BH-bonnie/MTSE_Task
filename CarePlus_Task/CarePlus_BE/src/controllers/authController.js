import authService from "../services/authService";

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

let forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const result = await authService.forgotPassword(email);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Yêu cầu khôi phục mật khẩu thất bại",
        });
    }
};

let resetPassword = async (req, res) => {
    try {
        const { email, otpCode, newPassword } = req.body;
        const result = await authService.resetPassword({ email, otpCode, newPassword });
        return res.status(200).json(result);
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Khôi phục mật khẩu thất bại",
        });
    }
};

module.exports = {
    login,
    getCurrentSession,
    sendVerificationCode,
    register,
    forgotPassword,
    resetPassword,
};
