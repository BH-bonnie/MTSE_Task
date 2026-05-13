import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";

const store = configureStore({
    reducer: {
        auth: authReducer,
        // Thêm các slice khác vào đây khi cần
        // doctor: doctorReducer,
        // appointment: appointmentReducer,
    },
    devTools: import.meta.env.DEV, // Bật Redux DevTools chỉ khi development
});

export default store;
