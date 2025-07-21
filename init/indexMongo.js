const mongoose = require("mongoose");
const initData = require("./data.js");
const {Listing , initializer} = require("../Models/listingMongo.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/myDatabase1";

main()
    .then(() => {
        console.log("connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    initData.data =  initData.data.map(obj => {
        return {
            ...obj,
            owner : '673a1b2adacbfeeeec4b3f55'
        }
    })
    await Listing.deleteMany({});
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
};



initDB();

//console.log(initData.data);