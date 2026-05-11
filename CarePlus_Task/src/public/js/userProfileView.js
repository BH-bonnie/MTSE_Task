document.addEventListener("DOMContentLoaded", async () => {
    const profilePage = document.querySelector('[data-auth-role="user"]');
    if (!profilePage) {
        return;
    }

    const normalizeGenderValue = (value) => {
        if (value === true || value === 1 || value === "1" || value === "true") {
            return true;
        }

        if (value === false || value === 0 || value === "0" || value === "false") {
            return false;
        }

        return null;
    };

    const user = await window.CarePlusAuth.requireAuth("user");
    if (!user) {
        return;
    }

    const { response, data } = await window.CarePlusAuth.apiFetch("/api/profile/me");
    if (!response.ok || !data?.success) {
        return;
    }

    const profile = data.user;
    const normalizedGender = normalizeGenderValue(profile.gender);

    document.getElementById("profileUsername").textContent = profile.username || "—";
    document.getElementById("profileEmail").textContent = profile.email || "—";
    document.getElementById("profileFullName").textContent = `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || "—";
    document.getElementById("profileRole").textContent = profile.role || "—";
    document.getElementById("profileStatus").textContent = profile.isActive ? "Đang hoạt động" : "Vô hiệu hóa";
    document.getElementById("profileLastLogin").textContent = profile.lastLoginAt
        ? new Date(profile.lastLoginAt).toLocaleString("vi-VN")
        : "Chưa có dữ liệu";
    document.getElementById("profileAddress").textContent = profile.address || "—";
    document.getElementById("profilePhone").textContent = profile.phone || "—";
    document.getElementById("profileGender").textContent = normalizedGender === null ? "—" : (normalizedGender ? "Nam" : "Nữ");
});
