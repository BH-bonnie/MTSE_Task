import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { message } from "antd";
import { Eye, EyeOff, Lock, User, ArrowRight, Loader2, Coffee } from "lucide-react";
import { motion } from "framer-motion";
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
    const [showPassword, setShowPassword] = useState(false);
    const [serverError, setServerError] = useState("");

    const isEmailLogin = useMemo(() => form.login.includes("@"), [form.login]);

    const validateForm = () => {
        const nextErrors = {};
        const normalizedLogin = form.login.trim();
        const normalizedPassword = form.password;

        if (!normalizedLogin) {
            nextErrors.login = "Email or Username is required.";
        }
        if (!normalizedPassword) {
            nextErrors.password = "Password is required.";
        } else if (normalizedPassword.length < 6) {
            nextErrors.password = "Password must be at least 6 characters.";
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
        if (!validateForm()) return;

        setSubmitting(true);
        setServerError("");

        try {
            const payload = {
                login: form.login.trim(),
                password: form.password,
            };
            const response = await loginApi(payload);
            const data = response?.data || {};
            const user = data?.user || null;
            const token = data?.token || null;

            if (!data?.success || !token || !user) {
                throw new Error(data?.message || "Invalid response from server.");
            }

            dispatch(loginSuccess({ token, user }));
            messageApi.success("Welcome back to BonnieTea!");
            
            const redirectUrl = data?.redirectUrl || getProfileRouteByRole(user?.role);
            navigate(redirectUrl, { replace: true });
        } catch (error) {
            const nextMessage = error.response?.data?.message || error.message || "Login failed. Please try again.";
            setServerError(nextMessage);
            messageApi.error(nextMessage);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FFFDFB] flex items-center justify-center p-4 md:p-8">
            {contextHolder}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-5xl bg-white rounded-[40px] shadow-2xl shadow-orange-100 overflow-hidden flex flex-col md:flex-row min-h-[650px]"
            >
                {/* Left Column: Visuals */}
                <div className="hidden md:flex md:w-1/2 relative bg-gradient-to-br from-orange-500 to-orange-700 p-12 flex-col justify-between overflow-hidden">
                    {/* Abstract circles for premium look */}
                    <div className="absolute top-[-10%] right-[-10%] w-80 h-80 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-orange-400/20 rounded-full blur-3xl" />
                    
                    <div className="relative z-10">
                        <Link to="/" className="flex items-center space-x-2 text-white group">
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                                <Coffee className="h-6 w-6" />
                            </div>
                            <span className="text-2xl font-black tracking-tighter">BonnieTea</span>
                        </Link>
                    </div>

                    <div className="relative z-10 space-y-6">
                        <motion.h1 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-5xl lg:text-6xl font-black text-white leading-tight"
                        >
                            Refine Your <br />
                            <span className="text-orange-200">Daily Routine</span>
                        </motion.h1>
                        <p className="text-orange-100 text-lg font-medium max-w-sm opacity-80">
                            Join our community to explore the finest tea blends and exclusive member rewards.
                        </p>
                    </div>

                    <div className="relative z-10">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-orange-600 overflow-hidden bg-orange-100">
                                    <img src={`https://i.pravatar.cc/150?u=${i}`} alt="user" />
                                </div>
                            ))}
                            <div className="w-10 h-10 rounded-full border-2 border-orange-600 bg-white flex items-center justify-center text-[10px] font-bold text-orange-600">
                                +2k
                            </div>
                        </div>
                        <p className="text-orange-200 text-xs mt-3 font-bold uppercase tracking-widest">Trusted by 2,000+ tea lovers</p>
                    </div>
                    
                    {/* Decorative Image */}
                    <img 
                        src="https://images.unsplash.com/photo-1544787210-2213d240ad4a?q=80&w=800" 
                        alt="Hero" 
                        className="absolute bottom-0 right-0 w-3/4 opacity-20 pointer-events-none translate-x-1/4 translate-y-1/4 rotate-12"
                    />
                </div>

                {/* Right Column: Form */}
                <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-white">
                    <div className="max-w-md mx-auto w-full">
                        <div className="mb-10">
                            <h2 className="text-3xl font-black text-gray-800 mb-2">Welcome Back</h2>
                            <p className="text-gray-400 font-medium">Please enter your details to sign in.</p>
                        </div>

                        {serverError && (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-2xl flex items-center gap-3"
                            >
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                {serverError}
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Account</label>
                                <div className={`relative group transition-all ${errors.login ? 'scale-[0.98]' : ''}`}>
                                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.login ? 'text-red-400' : 'text-gray-300 group-focus-within:text-orange-500'}`}>
                                        <User className="h-5 w-5" />
                                    </div>
                                    <input 
                                        name="login"
                                        type="text"
                                        value={form.login}
                                        onChange={handleChange}
                                        placeholder="Username or Email"
                                        className={`w-full bg-gray-50 border-2 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-bold text-gray-700 ${errors.login ? 'border-red-100 focus:border-red-200 focus:bg-red-50/30' : 'border-transparent focus:border-orange-500/20 focus:bg-white focus:ring-4 focus:ring-orange-500/5'}`}
                                    />
                                </div>
                                {errors.login && <p className="text-red-500 text-[11px] font-bold ml-1">{errors.login}</p>}
                                {!errors.login && form.login && (
                                    <p className="text-orange-500 text-[10px] font-black uppercase tracking-widest ml-1">
                                        Signing in as {isEmailLogin ? "Email" : "Username"}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Password</label>
                                    <Link to="/forgot-password" size="sm" className="text-xs font-bold text-orange-500 hover:text-orange-600">Forgot Password?</Link>
                                </div>
                                <div className="relative group">
                                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.password ? 'text-red-400' : 'text-gray-300 group-focus-within:text-orange-500'}`}>
                                        <Lock className="h-5 w-5" />
                                    </div>
                                    <input 
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        value={form.password}
                                        onChange={handleChange}
                                        placeholder="Min. 6 characters"
                                        className={`w-full bg-gray-50 border-2 rounded-2xl py-4 pl-12 pr-12 outline-none transition-all font-bold text-gray-700 ${errors.password ? 'border-red-100 focus:border-red-200 focus:bg-red-50/30' : 'border-transparent focus:border-orange-500/20 focus:bg-white focus:ring-4 focus:ring-orange-500/5'}`}
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-red-500 text-[11px] font-bold ml-1">{errors.password}</p>}
                            </div>

                            <div className="flex items-center space-x-3 px-1 pt-2">
                                <label className="relative flex items-center cursor-pointer group">
                                    <input type="checkbox" className="sr-only peer" />
                                    <div className="w-5 h-5 border-2 border-gray-200 rounded-md peer-checked:bg-orange-500 peer-checked:border-orange-500 transition-all flex items-center justify-center">
                                        <div className="w-2 h-2 bg-white rounded-full opacity-0 peer-checked:opacity-100 transition-opacity" />
                                    </div>
                                    <span className="ml-3 text-sm font-bold text-gray-500 group-hover:text-gray-700 transition-colors">Remember me</span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-orange-500 text-white py-4 rounded-[20px] font-black text-lg shadow-xl shadow-orange-100 hover:bg-orange-600 hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:hover:scale-100 transition-all flex items-center justify-center gap-3"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                        Authenticating...
                                    </>
                                ) : (
                                    <>
                                        Sign In <ArrowRight className="h-6 w-6" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-10 text-center">
                            <p className="text-gray-400 font-medium">
                                Don't have an account? <Link to="/register" className="text-orange-500 font-black hover:underline ml-1">Create Account</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
