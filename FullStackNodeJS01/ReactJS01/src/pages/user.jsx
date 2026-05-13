import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { updateProfile } from "../store/slices/authSlice";
import { getMyProfile, updateMyProfile } from "../util/api";
import { 
    User, Mail, Phone, MapPin, Camera, Save, 
    X, ShieldCheck, BadgeCheck, Loader2, Edit3, LogOut 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { message } from "antd";

const UserProfilePage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated, loading: authLoading } = useSelector((state) => state.auth);

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();

    const [form, setForm] = useState({
        name: "",
        phone: "",
        address: "",
        gender: "",
        avatar: "",
    });

    const fetchProfile = useCallback(async () => {
        try {
            const res = await getMyProfile();
            if (res.data?.success && res.data?.user) {
                const u = res.data.user;
                setProfile(u);
                setForm({
                    name: u.name || "",
                    phone: u.phone || "",
                    address: u.address || "",
                    gender: u.gender !== null ? String(u.gender) : "",
                    avatar: u.avatar || "",
                });
            }
        } catch (err) {
            // handle error in effect
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate("/login", { replace: true });
        }
    }, [authLoading, isAuthenticated, navigate]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchProfile();
        }
    }, [isAuthenticated, fetchProfile]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                ...form,
                gender: form.gender === "" ? null : form.gender === "true"
            };
            const res = await updateMyProfile(payload);
            if (res.data?.success) {
                const updated = res.data.user;
                setProfile(updated);
                dispatch(updateProfile(updated));
                messageApi.success("Profile updated successfully!");
                setIsEditing(false);
            }
        } catch (err) {
            messageApi.error(err.response?.data?.message || "Update failed");
        } finally {
            setSaving(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FFFDFB]">
                <Loader2 className="h-12 w-12 text-orange-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FFFDFB] pt-12 pb-24">
            {contextHolder}
            <div className="max-w-6xl mx-auto px-4">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black text-gray-800 tracking-tight">Account Settings</h1>
                        <p className="text-gray-400 font-medium">Manage your personal information and preferences.</p>
                    </div>
                    {!isEditing && (
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="bg-gray-800 text-white px-8 py-3.5 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-gray-900 transition-all shadow-xl shadow-gray-100"
                        >
                            <Edit3 className="h-4 w-4" />
                            Edit Profile
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Sidebar Card */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-[40px] p-8 border border-gray-50 shadow-sm text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-orange-100 to-orange-50" />
                            
                            <div className="relative z-10 pt-4 mb-6">
                                <div className="relative inline-block">
                                    <div className="w-32 h-32 rounded-[32px] overflow-hidden border-4 border-white shadow-xl bg-orange-50">
                                        {profile?.avatar ? (
                                            <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <User className="h-16 w-16 text-orange-200" />
                                            </div>
                                        )}
                                    </div>
                                    {isEditing && (
                                        <button className="absolute -bottom-2 -right-2 bg-orange-500 text-white p-2.5 rounded-xl border-4 border-white shadow-lg hover:scale-110 transition-transform">
                                            <Camera className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1 mb-8">
                                <h2 className="text-2xl font-black text-gray-800">{profile?.name || "Guest"}</h2>
                                <p className="text-gray-400 font-bold text-sm">@{profile?.username || "member"}</p>
                            </div>

                            <div className="flex items-center justify-center gap-2 mb-8">
                                <div className="bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-100 flex items-center gap-1.5">
                                    <BadgeCheck className="h-3 w-3" />
                                    {profile?.role || 'Member'}
                                </div>
                                <div className="bg-green-50 text-green-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100 flex items-center gap-1.5">
                                    <ShieldCheck className="h-3 w-3" />
                                    Verified
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 border-t border-gray-50 pt-8 mt-8">
                                <div>
                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Total Orders</p>
                                    <p className="text-xl font-black text-gray-800">12</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Points</p>
                                    <p className="text-xl font-black text-orange-500">850</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Form */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-[40px] p-8 md:p-12 border border-gray-50 shadow-sm relative overflow-hidden">
                            <AnimatePresence mode="wait">
                                {isEditing ? (
                                    <motion.form 
                                        key="edit"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        onSubmit={handleSave} 
                                        className="space-y-8"
                                    >
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Full Name</label>
                                            <div className="relative">
                                                <User className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                                                <input 
                                                    name="name" value={form.name} onChange={handleChange}
                                                    placeholder="Enter your full name"
                                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-orange-500/20 focus:bg-white rounded-2xl py-4 pl-14 pr-6 outline-none transition-all font-bold text-gray-700"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
                                                <div className="relative">
                                                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                                                    <input 
                                                        disabled value={profile?.email}
                                                        className="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-4 pl-14 pr-6 font-bold text-gray-400 cursor-not-allowed"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Phone Number</label>
                                                <div className="relative">
                                                    <Phone className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                                                    <input 
                                                        name="phone" value={form.phone} onChange={handleChange}
                                                        placeholder="Enter phone number"
                                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-orange-500/20 focus:bg-white rounded-2xl py-4 pl-14 pr-6 outline-none transition-all font-bold text-gray-700"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Current Address</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                                                <input 
                                                    name="address" value={form.address} onChange={handleChange}
                                                    placeholder="Enter your shipping address"
                                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-orange-500/20 focus:bg-white rounded-2xl py-4 pl-14 pr-6 outline-none transition-all font-bold text-gray-700"
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-8 flex items-center gap-4">
                                            <button 
                                                type="submit" disabled={saving}
                                                className="flex-1 bg-orange-500 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-orange-100 hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
                                            >
                                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                                Save Changes
                                            </button>
                                            <button 
                                                type="button" onClick={() => setIsEditing(false)}
                                                className="px-8 bg-gray-100 text-gray-500 py-4 rounded-2xl font-black text-sm hover:bg-gray-200 transition-all"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </motion.form>
                                ) : (
                                    <motion.div 
                                        key="view"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="space-y-12"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Full Name</p>
                                                <p className="text-lg font-bold text-gray-700">{profile?.name || "Not set"}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Email</p>
                                                <p className="text-lg font-bold text-gray-700">{profile?.email}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Phone</p>
                                                <p className="text-lg font-bold text-gray-700">{profile?.phone || <span className="text-gray-300 italic">Not set</span>}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Address</p>
                                                <p className="text-lg font-bold text-gray-700">{profile?.address || <span className="text-gray-300 italic">Not set</span>}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfilePage;
