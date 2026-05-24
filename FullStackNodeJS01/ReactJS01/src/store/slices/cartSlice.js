import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getCartApi, addToCartApi, updateCartItemApi, removeFromCartApi, clearCartApi } from "../../util/api";

export const fetchCart = createAsyncThunk(
    "cart/fetchCart",
    async (_, { rejectWithValue }) => {
        try {
            const res = await getCartApi();
            if (res.data?.success) {
                return res.data.cart;
            }
            return rejectWithValue("Không thể tải giỏ hàng");
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Lỗi tải giỏ hàng");
        }
    }
);

export const addToCart = createAsyncThunk(
    "cart/addToCart",
    async ({ productId, quantity }, { rejectWithValue }) => {
        try {
            const res = await addToCartApi({ productId, quantity });
            if (res.data?.success) {
                return { cart: res.data.cart, message: res.data.message };
            }
            return rejectWithValue("Không thể thêm vào giỏ hàng");
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Lỗi thêm vào giỏ hàng");
        }
    }
);

export const updateCartItem = createAsyncThunk(
    "cart/updateCartItem",
    async ({ productId, quantity }, { rejectWithValue }) => {
        try {
            const res = await updateCartItemApi({ productId, quantity });
            if (res.data?.success) {
                return { cart: res.data.cart, message: res.data.message };
            }
            return rejectWithValue("Không thể cập nhật giỏ hàng");
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Lỗi cập nhật giỏ hàng");
        }
    }
);

export const removeFromCart = createAsyncThunk(
    "cart/removeFromCart",
    async (productId, { rejectWithValue }) => {
        try {
            const res = await removeFromCartApi(productId);
            if (res.data?.success) {
                return { cart: res.data.cart, message: res.data.message };
            }
            return rejectWithValue("Không thể xóa sản phẩm");
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Lỗi xóa sản phẩm");
        }
    }
);

export const clearCart = createAsyncThunk(
    "cart/clearCart",
    async (_, { rejectWithValue }) => {
        try {
            const res = await clearCartApi();
            if (res.data?.success) {
                return { cart: res.data.cart, message: res.data.message };
            }
            return rejectWithValue("Không thể xóa giỏ hàng");
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Lỗi xóa giỏ hàng");
        }
    }
);

const calculateTotals = (items) => {
    let totalItems = 0;
    let totalAmount = 0;
    items.forEach(item => {
        if (item.product) {
            const price = item.product.promotionPrice > 0 ? item.product.promotionPrice : item.product.price;
            totalItems += item.quantity;
            totalAmount += price * item.quantity;
        }
    });
    return { totalItems, totalAmount };
};

const initialState = {
    items: [],
    totalAmount: 0,
    totalItems: 0,
    loading: false,
    error: null,
    successMessage: null
};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        clearCartLocal(state) {
            state.items = [];
            state.totalAmount = 0;
            state.totalItems = 0;
            state.error = null;
        },
        clearCartMessage(state) {
            state.successMessage = null;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        const handleCartFulfilled = (state, action) => {
            state.loading = false;
            const cart = action.payload.cart || action.payload;
            state.items = cart.items || [];
            const { totalItems, totalAmount } = calculateTotals(state.items);
            state.totalItems = totalItems;
            state.totalAmount = totalAmount;
            state.successMessage = action.payload.message || null;
            state.error = null;
        };

        const handleCartPending = (state) => {
            state.loading = true;
            state.error = null;
        };

        const handleCartRejected = (state, action) => {
            state.loading = false;
            state.error = action.payload || "Lỗi thao tác giỏ hàng";
        };

        builder
            // Fetch
            .addCase(fetchCart.pending, handleCartPending)
            .addCase(fetchCart.fulfilled, handleCartFulfilled)
            .addCase(fetchCart.rejected, handleCartRejected)
            // Add
            .addCase(addToCart.pending, handleCartPending)
            .addCase(addToCart.fulfilled, handleCartFulfilled)
            .addCase(addToCart.rejected, handleCartRejected)
            // Update
            .addCase(updateCartItem.pending, handleCartPending)
            .addCase(updateCartItem.fulfilled, handleCartFulfilled)
            .addCase(updateCartItem.rejected, handleCartRejected)
            // Remove
            .addCase(removeFromCart.pending, handleCartPending)
            .addCase(removeFromCart.fulfilled, handleCartFulfilled)
            .addCase(removeFromCart.rejected, handleCartRejected)
            // Clear
            .addCase(clearCart.pending, handleCartPending)
            .addCase(clearCart.fulfilled, handleCartFulfilled)
            .addCase(clearCart.rejected, handleCartRejected);
    }
});

export const { clearCartLocal, clearCartMessage } = cartSlice.actions;
export default cartSlice.reducer;
