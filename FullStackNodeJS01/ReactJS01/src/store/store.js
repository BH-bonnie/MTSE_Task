import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import cartReducer from "./slices/cartSlice";
import orderReducer from "./slices/orderSlice";

const store = configureStore({
    reducer: {
        auth: authReducer,
        cart: cartReducer,
        orders: orderReducer,
    },
    devTools: import.meta.env.DEV, // Bật Redux DevTools chỉ khi development
});

export default store;
