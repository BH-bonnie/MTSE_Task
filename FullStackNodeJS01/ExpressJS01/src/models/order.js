const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderCode: { type: String, unique: true, required: true },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        productName: { type: String, required: true },
        productImage: { type: String },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 }
    }],
    shippingAddress: {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        note: { type: String }
    },
    paymentMethod: { type: String, enum: ['COD'], default: 'COD', required: true },
    totalAmount: { type: Number, required: true },
    status: {
        type: String,
        enum: ['new', 'confirmed', 'preparing', 'shipping', 'delivered', 'cancelled', 'cancel_requested'],
        default: 'new',
        required: true
    },
    statusHistory: [{
        status: { type: String, required: true },
        changedAt: { type: Date, default: Date.now },
        note: { type: String }
    }],
    cancelReason: { type: String },
    autoConfirmAt: { type: Date }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
