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

            const pageNum = parseInt(req.query.page) || 1;
            const limitNum = parseInt(req.query.limit) || 10;
            const skip = (pageNum - 1) * limitNum;

            const total = await Product.countDocuments(query);
            const products = await Product.find(query)
                .populate('category')
                .sort(sortQuery)
                .skip(skip)
                .limit(limitNum);

            res.status(200).json({ 
                products,
                pagination: {
                    total,
                    page: pageNum,
                    limit: limitNum,
                    totalPages: Math.ceil(total / limitNum)
                }
            });
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
    },

    getTopProducts: async (req, res) => {
        try {
            const pageNum = parseInt(req.query.page) || 1;
            const limitNum = parseInt(req.query.limit) || 10;
            const skip = (pageNum - 1) * limitNum;
            
            // Top 10 best-selling products
            const bestSellingTotal = await Product.countDocuments({ sold: { $gt: 0 } });
            const bestSelling = await Product.find()
                .sort({ sold: -1 })
                .skip(skip)
                .limit(limitNum);

            // Top 10 most viewed products
            const mostViewedTotal = await Product.countDocuments({ views: { $gt: 0 } });
            const mostViewed = await Product.find()
                .sort({ views: -1 })
                .skip(skip)
                .limit(limitNum);

            res.status(200).json({ 
                bestSelling: {
                    products: bestSelling,
                    pagination: {
                        total: bestSellingTotal,
                        page: pageNum,
                        limit: limitNum,
                        totalPages: Math.ceil(bestSellingTotal / limitNum)
                    }
                }, 
                mostViewed: {
                    products: mostViewed,
                    pagination: {
                        total: mostViewedTotal,
                        page: pageNum,
                        limit: limitNum,
                        totalPages: Math.ceil(mostViewedTotal / limitNum)
                    }
                }
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = productController;
