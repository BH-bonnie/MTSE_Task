const Product = require("../models/product");
const Category = require("../models/category");

const productController = {
    getAllProducts: async (req, res) => {
        try {
            const { category, search, minPrice, maxPrice, sort } = req.query;
            let query = {};

            if (category) {
                const cat = await Category.findOne({ slug: category });
                if (cat) query.category = cat._id;
            }

            if (search) {
                query.name = { $regex: search, $options: 'i' };
            }

            if (minPrice || maxPrice) {
                query.price = {};
                if (minPrice) query.price.$gte = Number(minPrice);
                if (maxPrice) query.price.$lte = Number(maxPrice);
            }

            let sortQuery = {};
            if (sort === 'price_asc') sortQuery.price = 1;
            else if (sort === 'price_desc') sortQuery.price = -1;
            else if (sort === 'newest') sortQuery.createdAt = -1;
            else sortQuery.createdAt = -1;

            const products = await Product.find(query).populate('category').sort(sortQuery);
            res.status(200).json({ products });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }

    },

    getProductById: async (req, res) => {
        try {
            const product = await Product.findById(req.params.id).populate('category');
            if (!product) return res.status(404).json({ message: "Product not found" });

            // Find similar products
            const similarProducts = await Product.find({
                category: product.category._id,
                _id: { $ne: product._id }
            }).limit(4);

            res.status(200).json({ product, similarProducts });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getHomeProducts: async (req, res) => {
        try {
            const newest = await Product.find({ isNewest: true }).limit(8);
            const bestSellers = await Product.find({ isBestSeller: true }).limit(8);
            const promotions = await Product.find({ promotionPrice: { $gt: 0 } }).limit(8);

            res.status(200).json({ newest, bestSellers, promotions });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getCategories: async (req, res) => {
        try {
            const categories = await Category.find();
            res.status(200).json(categories);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = productController;
