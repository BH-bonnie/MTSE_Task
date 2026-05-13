import axios from "./axios.customize";

/**
 * Lấy thông tin profile của user đang đăng nhập
 */
export const getMyProfile = () => {
    return axios.get("/v1/api/profile/me");
};

/**
 * Cập nhật profile của user đang đăng nhập
 */
export const updateMyProfile = (data) => {
    return axios.put("/v1/api/profile/me", data);
};

/**
 * Đăng nhập

 * POST /v1/api/login
 */
export const loginApi = (credentials) => {
    return axios.post("/v1/api/login", credentials);
};

/**
 * Gửi mã xác thực đăng ký
 * POST /v1/api/send-verification-code
 */
export const sendVerificationCodeApi = (payload) => {
    return axios.post("/v1/api/send-verification-code", payload);
};

/**
 * Đăng ký tài khoản mới
 * POST /v1/api/register
 */
export const registerApi = (payload) => {
    return axios.post("/v1/api/register", payload);
};


/**
 * Lấy thông tin phiên đăng nhập hiện tại
 * GET /v1/api/account
 */
export const getCurrentSession = () => {
    return axios.get("/v1/api/account");
};

/**
 * Quên mật khẩu & Reset (Dựa trên logic hiện có)
 */
export const forgotPasswordApi = (payload) => {
    return axios.post("/v1/api/forgot-password", payload);
};

export const resetPasswordApi = (payload) => {
    return axios.post("/v1/api/reset-password", payload);
};

// Product APIs
export const getHomeProductsApi = () => {
    return axios.get("/v1/api/products/home");
};

export const getAllProductsApi = (params) => {
    return axios.get("/v1/api/products", { params });
};

export const getProductDetailApi = (id) => {
    return axios.get(`/v1/api/products/${id}`);
};

export const getCategoriesApi = () => {
    return axios.get("/v1/api/categories");
};

// User Management (Admin)
export const getAllUsers = () => {
    return axios.get("/v1/api/users");
};

export const getUserById = (userId) => {
    return axios.get(`/v1/api/users/${userId}`);
};

export const createUserApi = (data) => {
    return axios.post("/v1/api/users", data);
};

export const updateUserApi = (userId, data) => {
    return axios.put(`/v1/api/users/${userId}`, data);
};

export const deleteUserApi = (userId) => {
    return axios.delete(`/v1/api/users/${userId}`);
};
