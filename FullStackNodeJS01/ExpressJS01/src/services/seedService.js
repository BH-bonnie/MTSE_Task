const Category = require("../models/category");
const Product = require("../models/product");
const User = require("../models/user");
const bcrypt = require("bcrypt");

const seedData = async () => {
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash("123456", saltRounds);

        // Clear existing data
        await Category.deleteMany({});
        await Product.deleteMany({});
        await User.deleteMany({});

        // Seed Users
        const users = [
            {
                _id: "6a0432e9bd2069466bab2768", // ID bạn yêu cầu
                name: "Bonnie Member",
                email: "member@gmail.com",
                password: hashedPassword,
                role: "member"
            },
            {
                name: "Bonnie Admin",
                email: "admin@gmail.com",
                password: hashedPassword,
                role: "admin"
            }
        ];
        await User.insertMany(users);
        console.log(">>> Users seeded successfully!");


        const categories = [
            { name: "Milk Tea", slug: "milk-tea", description: "Traditional and modern milk teas" },
            { name: "Fruit Tea", slug: "fruit-tea", description: "Refreshing fruit-based teas" },
            { name: "Coffee", slug: "coffee", description: "Energizing coffee drinks" },
            { name: "Smoothies", slug: "smoothies", description: "Blended ice fruit drinks" }
        ];

        const createdCategories = await Category.insertMany(categories);

        const products = [
            {
                name: "Classic Pearl Milk Tea",
                slug: "classic-pearl-milk-tea",
                description: "The original milk tea with chewy tapioca pearls.",
                price: 35000,
                promotionPrice: 30000,
                images: ["https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=600", "https://images.unsplash.com/photo-1594911772125-07fc7a2d8d9f?q=80&w=600"],
                category: createdCategories[0]._id,
                stock: 100,
                sold: 250,
                isBestSeller: true,
                isNewest: false,
                details: "Ingredients: Black tea, milk, sugar, tapioca pearls. Calories: 350kcal."
            },
            {
                name: "Brown Sugar Boba Milk",
                slug: "brown-sugar-boba-milk",
                description: "Fresh milk with warm brown sugar pearls.",
                price: 45000,
                promotionPrice: 0,
                images: ["https://images.unsplash.com/photo-1558857563-b371f30bb673?q=80&w=600"],
                category: createdCategories[0]._id,
                stock: 50,
                sold: 500,
                isBestSeller: true,
                isNewest: true,
                details: "Ingredients: Fresh milk, brown sugar, boba. Calories: 450kcal."
            },
            {
                name: "Matcha Latte",
                slug: "matcha-latte",
                description: "Premium Japanese matcha with creamy milk.",
                price: 40000,
                promotionPrice: 35000,
                images: ["https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=600"],
                category: createdCategories[0]._id,
                stock: 80,
                sold: 120,
                isBestSeller: false,
                isNewest: true,
                details: "Ingredients: Uji matcha, milk, sweetener. Calories: 250kcal."
            },
            {
                name: "Lychee Fruit Tea",
                slug: "lychee-fruit-tea",
                description: "Jasmine tea with fresh lychee and jelly.",
                price: 38000,
                promotionPrice: 0,
                images: ["https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=600"],
                category: createdCategories[1]._id,
                stock: 60,
                sold: 80,
                isBestSeller: false,
                isNewest: true,
                details: "Ingredients: Jasmine green tea, lychee syrup, fresh lychee pieces. Calories: 150kcal."
            },
            {
                name: "Peach Orange Lemongrass Tea",
                slug: "peach-orange-lemongrass",
                description: "Signature fruit tea with peach, orange and lemongrass flavor.",
                price: 42000,
                promotionPrice: 38000,
                images: ["https://images.unsplash.com/photo-1597403343454-11b332bc5620?q=80&w=600"],
                category: createdCategories[1]._id,
                stock: 120,
                sold: 300,
                isBestSeller: true,
                isNewest: false,
                details: "Ingredients: Black tea, peach, orange, lemongrass. Calories: 200kcal."
            }
        ];

        // Generate 30 extra products for pagination and scrolling
        const extraProducts = [];
        const baseImages = [
            "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=600",
            "https://images.unsplash.com/photo-1558857563-b371f30bb673?q=80&w=600",
            "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=600",
            "https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=600",
            "https://images.unsplash.com/photo-1597403343454-11b332bc5620?q=80&w=600",
            "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=600"
        ];
        
        for (let i = 1; i <= 30; i++) {
            const catIndex = i % categories.length;
            const isBest = i % 3 === 0;
            const isNew = i % 2 === 0;
            const hasPromo = i % 4 === 0;
            const price = 30000 + (Math.floor(Math.random() * 20) * 1000);
            
            extraProducts.push({
                name: `Awesome Drink ${i}`,
                slug: `awesome-drink-${i}`,
                description: `This is a randomly generated delicious drink number ${i}.`,
                price: price,
                promotionPrice: hasPromo ? price - 5000 : 0,
                images: [baseImages[i % baseImages.length]],
                category: createdCategories[catIndex]._id,
                stock: 50 + i,
                sold: isBest ? 200 + i * 10 : 10 + i,
                views: isBest ? 500 + i * 20 : 50 + i,
                isBestSeller: isBest,
                isNewest: isNew,
                details: `Ingredients: Tea, sugar, water. Calories: ${200 + i}kcal.`
            });
        }

        await Product.insertMany([...products, ...extraProducts]);
        console.log("Data seeded successfully!");
    } catch (error) {
        console.error("Error seeding data:", error);
    }
};

module.exports = seedData;
