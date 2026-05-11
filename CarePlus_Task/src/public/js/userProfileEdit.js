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

    const showMessage = (id, message) => {
        const element = document.getElementById(id);
        if (!element) {
            return;
        }

        element.textContent = message;
        element.classList.remove("d-none");
    };

    const hideMessage = (id) => {
        const element = document.getElementById(id);
        if (!element) {
            return;
        }

        element.textContent = "";
        element.classList.add("d-none");
    };

    const fillProfileForm = (form, user) => {
        form.querySelector('[name="username"]').value = user.username || "";
        form.querySelector('[name="email"]').value = user.email || "";
        form.querySelector('[name="firstName"]').value = user.firstName || "";
        form.querySelector('[name="lastName"]').value = user.lastName || "";
        form.querySelector('[name="address"]').value = user.address || "";
        form.querySelector('[name="phone"]').value = user.phone || "";
        form.querySelector('[name="password"]').value = "";

        const normalizedGender = normalizeGenderValue(user.gender);
        form.querySelector('[name="gender"]').value = normalizedGender === null ? "" : (normalizedGender ? "1" : "0");
    };

    const currentSessionUser = await window.CarePlusAuth.requireAuth("user");
    if (!currentSessionUser) {
        return;
    }

    const form = document.getElementById("userProfileForm");
    if (!form) {
        return;
    }

    const { response, data } = await window.CarePlusAuth.apiFetch("/api/profile/me");
    if (!response.ok || !data?.success) {
        showMessage("profileUpdateError", data?.message || "Không thể tải hồ sơ người dùng");
        return;
    }

    fillProfileForm(form, data.user);

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        hideMessage("profileUpdateError");
        hideMessage("profileUpdateSuccess");

        const formData = new FormData(form);
        const payload = Object.fromEntries(formData.entries());

        if (!payload.password) {
            delete payload.password;
        }

        const { response: updateResponse, data: updateData } = await window.CarePlusAuth.apiFetch("/api/profile/me", {
            method: "PUT",
            body: JSON.stringify(payload),
        });

        if (!updateResponse.ok || !updateData?.success) {
            showMessage("profileUpdateError", updateData?.message || "Không thể cập nhật hồ sơ");
            return;
        }

        const mergedUser = {
            ...window.CarePlusAuth.getStoredUser(),
            ...updateData.user,
        };

        window.CarePlusAuth.setSession(window.CarePlusAuth.getToken(), mergedUser);
        fillProfileForm(form, mergedUser);
        showMessage("profileUpdateSuccess", updateData.message || "Cập nhật hồ sơ thành công");
    });
});
