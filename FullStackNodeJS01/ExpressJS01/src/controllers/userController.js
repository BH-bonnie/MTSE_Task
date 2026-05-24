const userService = require('../services/userService');
const { createUserService, loginService, getUserService } = userService;

const createUser = async (req, res) => {
    const { username, name, email, password } = req.body;
    const displayName = name || username;
    const result = await createUserService(displayName, email, password);
    
    if (result) {
        return res.status(200).json({
            success: true,
            message: "User created successfully",
            user: result
        });
    }
    
    return res.status(400).json({
        success: false,
        message: "Email already exists or invalid data"
    });
}

const handleLogin = async (req, res) => {
    const { login, email, password } = req.body;
    const loginEmail = email || login; // Hỗ trợ cả 2 tên trường
    const data = await loginService(loginEmail, password);
    
    if (data && data.EC === 0) {
        return res.status(200).json({
            success: true,
            message: "Login successful",
            token: data.access_token,
            user: data.user
        });
    }
    
    return res.status(401).json({
        success: false,
        message: data?.EM || "Invalid email or password"
    });
}

const getUser = async (req, res) => {
    const data = await getUserService();
    return res.status(200).json(data);
}
const getAccount = async (req, res) => {
    const User = require('../models/user');
    try {
        const user = await User.findOne({ email: req.user.email }).select("-password");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        return res.status(200).json({ success: true, user });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

const handleSendVerificationCode = async (req, res) => {
    const { email } = req.body;
    const result = await userService.sendVerificationCodeService(email);
    return res.status(result.success ? 200 : 400).json(result);
}

const handleForgotPassword = async (req, res) => {
    const { email } = req.body;
    const result = await userService.forgotPasswordService(email);
    return res.status(result.success ? 200 : 400).json(result);
}

const handleResetPassword = async (req, res) => {
    const { email, otpCode, newPassword } = req.body;
    const result = await userService.resetPasswordService(email, otpCode, newPassword);
    return res.status(result.success ? 200 : 400).json(result);
}

const handleGetProfile = async (req, res) => {
    const email = req.user.email;
    const result = await userService.getProfileService(email);
    return res.status(result.success ? 200 : 404).json(result);
}

const handleUpdateProfile = async (req, res) => {
    const email = req.user.email;
    const result = await userService.updateProfileService(email, req.body);
    return res.status(result.success ? 200 : 400).json(result);
}

module.exports = { 
    createUser, 
    handleLogin, 
    getUser, 
    getAccount,
    handleSendVerificationCode,
    handleForgotPassword,
    handleResetPassword,
    handleGetProfile,
    handleUpdateProfile
}
