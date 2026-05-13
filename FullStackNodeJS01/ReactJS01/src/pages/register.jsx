import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { message } from "antd";
import { 
    User, Mail, Lock, Eye, EyeOff, Send, CheckCircle2, 
    Loader2, UserPlus, ArrowLeft, ShieldCheck, Sparkles 
} from "lucide-react";
import { motion } from "framer-motion";
import { registerApi, sendVerificationCodeApi } from "../util/api";

const MIN_PASSWORD_LENGTH = 6;
const VERIFICATION_CODE_LENGTH = 5;
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

    useEffect(() => {
        if (!cooldown) return;
        const timer = setInterval(() => {
            setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
        }, 1000);
        return () => clearInterval(timer);
    }, [cooldown]);

    const lockedFields = verificationRequested;

    const validateForm = ({ requireOTP = true } = {}) => {
        const nextErrors = {};
        if (!form.username.trim()) nextErrors.username = "Username is required.";
        if (!form.email.trim()) nextErrors.email = "Email is required.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = "Invalid email format.";
        
        if (!form.password) nextErrors.password = "Password is required.";
        else if (form.password.length < MIN_PASSWORD_LENGTH) nextErrors.password = `Min ${MIN_PASSWORD_LENGTH} characters.`;
        
        if (form.confirmPassword !== form.password) nextErrors.confirmPassword = "Passwords do not match.";

        if (requireOTP) {
            if (!form.verificationCode.trim()) nextErrors.verificationCode = "OTP is required.";
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (lockedFields && ["username", "email", "password", "confirmPassword"].includes(name)) return;
        setForm((prev) => ({ ...prev, [name]: value }));
        setServerError("");
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleSendCode = async () => {
        if (!validateForm({ requireOTP: false })) return;
        setSendingCode(true);
        setServerError("");
        try {
            const res = await sendVerificationCodeApi({
                username: form.username.trim(),
                email: form.email.trim(),
            });
            if (!res.data?.success) throw new Error(res.data?.message || "Failed to send code.");
            setVerificationRequested(true);
            setCooldown(CODE_COOLDOWN_SECONDS);
            setServerSuccess("OTP sent to your email!");
            messageApi.success("Verification code sent!");
        } catch (error) {
            setServerError(error.response?.data?.message || error.message);
        } finally {
            setSendingCode(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setSubmitting(true);
        setServerError("");
        try {
            const res = await registerApi({
                username: form.username.trim(),
                email: form.email.trim(),
                password: form.password,
                verificationCode: form.verificationCode.trim(),
            });
            if (!res.data?.success) throw new Error(res.data?.message || "Registration failed.");
            messageApi.success("Account created successfully!");
            setServerSuccess("Success! Redirecting to login...");
            setTimeout(() => navigate("/login"), 1500);
        } catch (error) {
            setServerError(error.response?.data?.message || error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FFFDFB] flex items-center justify-center p-4 md:p-8">
            {contextHolder}
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-6xl bg-white rounded-[40px] shadow-2xl shadow-orange-100 overflow-hidden flex flex-col lg:flex-row"
            >
                {/* Left Column: Info */}
                <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-[#5C4033] to-[#3E2723] p-12 flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl" />
                    
                    <div className="relative z-10">
                        <Link to="/" className="flex items-center gap-2 text-white group">
                            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                            <span className="font-bold">Back to Shop</span>
                        </Link>
                    </div>

                    <div className="relative z-10 space-y-8">
                        <div className="bg-orange-500 w-16 h-16 rounded-3xl flex items-center justify-center shadow-xl shadow-orange-900/20">
                            <UserPlus className="text-white h-8 w-8" />
                        </div>
                        <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight">
                            Start Your <br />
                            <span className="text-orange-400">Tea Journey</span> <br />
                            With Us.
                        </h1>
                        <p className="text-orange-100/60 font-medium leading-relaxed max-w-xs">
                            Join over 2,000+ members and enjoy exclusive flavors and special rewards every day.
                        </p>
                    </div>

                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center gap-4 text-white/80">
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                <ShieldCheck className="h-5 w-5 text-orange-400" />
                            </div>
                            <span className="text-sm font-bold tracking-wide">Secure Data Encryption</span>
                        </div>
                        <div className="flex items-center gap-4 text-white/80">
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                <Sparkles className="h-5 w-5 text-orange-400" />
                            </div>
                            <span className="text-sm font-bold tracking-wide">Exclusive Member Access</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Form */}
                <div className="flex-1 p-8 md:p-16 bg-white overflow-y-auto max-h-[90vh] lg:max-h-none">
                    <div className="max-w-xl mx-auto">
                        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <h2 className="text-3xl font-black text-gray-800 mb-2">Create Account</h2>
                                <p className="text-gray-400 font-medium">Join BonnieTea for special benefits.</p>
                            </div>
                            <Link to="/login" className="text-orange-500 font-black text-sm hover:underline">Already a member?</Link>
                        </div>

                        {(serverError || serverSuccess) && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`mb-8 p-4 rounded-2xl border flex items-center gap-3 text-sm font-bold ${serverError ? 'bg-red-50 border-red-100 text-red-600' : 'bg-green-50 border-green-100 text-green-600'}`}
                            >
                                {serverError ? <div className="w-2 h-2 bg-red-500 rounded-full" /> : <CheckCircle2 className="h-5 w-5" />}
                                {serverError || serverSuccess}
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Username</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-orange-500 transition-colors" />
                                    <input 
                                        name="username" type="text" value={form.username} onChange={handleChange} readOnly={lockedFields}
                                        placeholder="Tên tài khoản"
                                        className={`w-full bg-gray-50 border-2 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-bold text-gray-700 ${errors.username ? 'border-red-100' : 'border-transparent focus:border-orange-500/20 focus:bg-white'}`}
                                    />
                                </div>
                                {errors.username && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.username}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-orange-500 transition-colors" />
                                    <input 
                                        name="email" type="email" value={form.email} onChange={handleChange} readOnly={lockedFields}
                                        placeholder="example@mail.com"
                                        className={`w-full bg-gray-50 border-2 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-bold text-gray-700 ${errors.email ? 'border-red-100' : 'border-transparent focus:border-orange-500/20 focus:bg-white'}`}
                                    />
                                </div>
                                {errors.email && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-orange-500 transition-colors" />
                                    <input 
                                        name="password" type={showPassword ? "text" : "password"} value={form.password} onChange={handleChange} readOnly={lockedFields}
                                        placeholder="••••••••"
                                        className={`w-full bg-gray-50 border-2 rounded-2xl py-4 pl-12 pr-12 outline-none transition-all font-bold text-gray-700 ${errors.password ? 'border-red-100' : 'border-transparent focus:border-orange-500/20 focus:bg-white'}`}
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.password}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Confirm Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-orange-500 transition-colors" />
                                    <input 
                                        name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} readOnly={lockedFields}
                                        placeholder="••••••••"
                                        className={`w-full bg-gray-50 border-2 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-bold text-gray-700 ${errors.confirmPassword ? 'border-red-100' : 'border-transparent focus:border-orange-500/20 focus:bg-white'}`}
                                    />
                                </div>
                                {errors.confirmPassword && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.confirmPassword}</p>}
                            </div>

                            {/* OTP Section */}
                            <div className="md:col-span-2 space-y-2 pt-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Email Verification</label>
                                <div className="flex gap-4">
                                    <div className="relative flex-1 group">
                                        <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-orange-500 transition-colors" />
                                        <input 
                                            name="verificationCode" type="text" maxLength={VERIFICATION_CODE_LENGTH} value={form.verificationCode} onChange={handleChange}
                                            placeholder="OTP Code"
                                            className={`w-full bg-gray-50 border-2 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-bold text-gray-700 tracking-[0.5em] ${errors.verificationCode ? 'border-red-100' : 'border-transparent focus:border-orange-500/20 focus:bg-white'}`}
                                        />
                                    </div>
                                    <button 
                                        type="button" onClick={handleSendCode} disabled={cooldown > 0 || sendingCode}
                                        className="px-8 bg-orange-50 text-orange-600 rounded-2xl font-black text-sm hover:bg-orange-500 hover:text-white disabled:opacity-50 transition-all border-2 border-orange-100 flex items-center gap-2 whitespace-nowrap"
                                    >
                                        {sendingCode ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                        {cooldown > 0 ? `Resend (${cooldown}s)` : "Get OTP"}
                                    </button>
                                </div>
                                {errors.verificationCode && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.verificationCode}</p>}
                            </div>

                            <div className="md:col-span-2 pt-8">
                                <button
                                    type="submit" disabled={submitting || !verificationRequested}
                                    className="w-full bg-orange-500 text-white py-5 rounded-[24px] font-black text-lg shadow-xl shadow-orange-100 hover:bg-orange-600 disabled:opacity-50 disabled:grayscale transition-all flex items-center justify-center gap-3"
                                >
                                    {submitting ? <Loader2 className="h-6 w-6 animate-spin" /> : <UserPlus className="h-6 w-6" />}
                                    Create My Account
                                </button>
                                {!verificationRequested && (
                                    <p className="text-center text-[11px] text-gray-400 font-bold mt-4 uppercase tracking-widest">Please verify your email first</p>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default RegisterPage;
