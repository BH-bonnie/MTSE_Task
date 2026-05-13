const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    price: { type: Number, required: true },
    promotionPrice: { type: Number, default: 0 },
    images: [{ type: String }],
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    stock: { type: Number, default: 0 },
    sold: { type: Number, default: 0 },
    isNewest: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    details: String,
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
