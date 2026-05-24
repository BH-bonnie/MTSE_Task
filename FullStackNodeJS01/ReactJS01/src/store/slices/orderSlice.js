import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { checkoutApi, getOrdersApi, getOrderByIdApi, cancelOrderApi, getAdminOrdersApi, updateOrderStatusApi } from "../../util/api";
import { clearCartLocal } from "./cartSlice";

export const checkout = createAsyncThunk(
    "orders/checkout",
    async (shippingAddress, { dispatch, rejectWithValue }) => {
        try {
            const res = await checkoutApi({ shippingAddress });
            if (res.data?.success) {
                dispatch(clearCartLocal());
                return res.data.order;
            }
            return rejectWithValue("Đặt hàng thất bại");
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Lỗi đặt hàng");
        }
    }
);

export const fetchOrders = createAsyncThunk(
    "orders/fetchOrders",
    async ({ status, page, limit } = {}, { rejectWithValue }) => {
        try {
            const res = await getOrdersApi({ status, page, limit });
            if (res.data?.success) {
                return {
                    orders: res.data.orders,
                    pagination: res.data.pagination
                };
            }
            return rejectWithValue("Không thể tải danh sách đơn hàng");
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Lỗi tải đơn hàng");
        }
    }
);

export const fetchOrderById = createAsyncThunk(
    "orders/fetchOrderById",
    async (id, { rejectWithValue }) => {
        try {
            const res = await getOrderByIdApi(id);
            if (res.data?.success) {
                return res.data.order;
            }
            return rejectWithValue("Không thể tải chi tiết đơn hàng");
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Lỗi tải chi tiết đơn hàng");
        }
    }
);

export const cancelOrder = createAsyncThunk(
    "orders/cancelOrder",
    async ({ id, reason }, { rejectWithValue }) => {
        try {
            const res = await cancelOrderApi(id, reason);
            if (res.data?.success) {
                return { order: res.data.order, message: res.data.message };
            }
            return rejectWithValue("Không thể hủy đơn hàng");
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Lỗi hủy đơn hàng");
        }
    }
);

// Admin Thunks
export const fetchAdminOrders = createAsyncThunk(
    "orders/fetchAdminOrders",
    async ({ status, page, limit } = {}, { rejectWithValue }) => {
        try {
            const res = await getAdminOrdersApi({ status, page, limit });
            if (res.data?.success) {
                return {
                    orders: res.data.orders,
                    pagination: res.data.pagination
                };
            }
            return rejectWithValue("Không thể tải danh sách đơn hàng toàn hệ thống");
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Lỗi tải đơn hàng admin");
        }
    }
);

export const updateOrderStatus = createAsyncThunk(
    "orders/updateOrderStatus",
    async ({ id, status, note }, { rejectWithValue }) => {
        try {
            const res = await updateOrderStatusApi(id, status, note);
            if (res.data?.success) {
                return res.data.order;
            }
            return rejectWithValue("Không thể cập nhật trạng thái đơn hàng");
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Lỗi cập nhật trạng thái");
        }
    }
);

const initialState = {
    orders: [],
    currentOrder: null,
    pagination: null,
    loading: false,
    error: null,
    checkoutSuccess: false,
    successMessage: null
};

const orderSlice = createSlice({
    name: "orders",
    initialState,
    reducers: {
        resetCheckoutSuccess(state) {
            state.checkoutSuccess = false;
            state.successMessage = null;
            state.error = null;
        },
        clearOrderMessage(state) {
            state.successMessage = null;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Checkout
            .addCase(checkout.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.checkoutSuccess = false;
            })
            .addCase(checkout.fulfilled, (state, action) => {
                state.loading = false;
                state.currentOrder = action.payload;
                state.checkoutSuccess = true;
                state.error = null;
            })
            .addCase(checkout.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Lỗi khi thanh toán";
                state.checkoutSuccess = false;
            })

            // Fetch list
            .addCase(fetchOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload.orders;
                state.pagination = action.payload.pagination;
                state.error = null;
            })
            .addCase(fetchOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Lỗi khi lấy danh sách đơn hàng";
            })

            // Fetch detail
            .addCase(fetchOrderById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrderById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentOrder = action.payload;
                state.error = null;
            })
            .addCase(fetchOrderById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Lỗi khi lấy chi tiết đơn hàng";
            })

            // Cancel
            .addCase(cancelOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(cancelOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.currentOrder = action.payload.order;
                // Update item in orders list
                state.orders = state.orders.map(o => o._id === action.payload.order._id ? action.payload.order : o);
                state.successMessage = action.payload.message || "Đã hủy đơn hàng";
                state.error = null;
            })
            .addCase(cancelOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Lỗi khi hủy đơn hàng";
            })

            // Admin Fetch List
            .addCase(fetchAdminOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAdminOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload.orders;
                state.pagination = action.payload.pagination;
                state.error = null;
            })
            .addCase(fetchAdminOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Lỗi khi lấy danh sách đơn hàng admin";
            })

            // Admin Update status
            .addCase(updateOrderStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateOrderStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.currentOrder = action.payload;
                state.orders = state.orders.map(o => o._id === action.payload._id ? action.payload : o);
                state.successMessage = "Đã cập nhật trạng thái đơn hàng";
                state.error = null;
            })
            .addCase(updateOrderStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Lỗi khi cập nhật trạng thái đơn hàng";
            });
    }
});

export const { resetCheckoutSuccess, clearOrderMessage } = orderSlice.actions;
export default orderSlice.reducer;
