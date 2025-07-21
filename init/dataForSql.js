const { v4: uuidv4 } = require('uuid');
const sampleListings = [
    {
        product_id: uuidv4(),
        product_name: "Classic T-Shirt",
        category: "Clothing",
        price: 1500,
        description: "A comfortable and stylish t-shirt for daily wear.",
        features: "1. 100% cotton\n2. Available in multiple colors\n3. Machine washable",
    },
    {
        product_id: uuidv4(),
        product_name: "Slim Fit Jeans",
        category: "Clothing",
        price: 2500,
        description: "Trendy slim-fit jeans for casual and formal occasions.",
        features: "1. Stretchable fabric\n2. Mid-rise waist\n3. Available in multiple sizes",
    },
    {
        product_id: uuidv4(),
        product_name: "Hooded Sweatshirt",
        category: "Clothing",
        price: 2000,
        description: "Warm and cozy hoodie for winter days.",
        features: "1. Fleece-lined\n2. Front pocket\n3. Adjustable drawstrings",
    },
    {
        product_id: uuidv4(),
        product_name: "Leather Jacket",
        category: "Clothing",
        price: 8000,
        description: "Premium leather jacket for a stylish look.",
        features: "1. Genuine leather\n2. Zipper closure\n3. Available in black and brown",
    },
    {
        product_id: uuidv4(),
        product_name: "Summer Shorts",
        category: "Clothing",
        price: 1200,
        description: "Lightweight shorts perfect for summer outings.",
        features: "1. Breathable fabric\n2. Elastic waistband\n3. Multiple pockets",
    },
    {
        product_id: uuidv4(),
        product_name: "Formal Shirt",
        category: "Clothing",
        price: 2200,
        description: "Elegant formal shirt suitable for office and events.",
        features: "1. Wrinkle-free\n2. Full sleeves\n3. Slim fit",
    },
    {
        product_id: uuidv4(),
        product_name: "Sports Tracksuit",
        category: "Clothing",
        price: 3500,
        description: "Comfortable tracksuit ideal for workouts and jogging.",
        features: "1. Moisture-wicking\n2. Includes jacket and pants\n3. Reflective stripes",
    },
];

module.exports = sampleListings;