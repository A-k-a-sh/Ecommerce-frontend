const express = require('express');
const path = require('path');
const dbb = require('../init/sqlDbinitializer')

const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const { Listing, initializer } = require('../Models/Mongo model/listingMongo');
initializer();

const ExpressError = require('../ExpressError');

const validateListing = require('../utils/validatListing');


const asyncWrap = require('../utils/wrapAsync');

const isLoggedIn = require('../utils/isLoggedIn');

const currentUrl = require('../utils/currentUrl');
const isOwner = require('../utils/isOwner');

const isAdmin = require('../utils/isAdmin');

const multer = require('multer');

const upload = multer({ dest: 'public/uploads' });

const couldinaryUpload = require('../utils/cloudnaryConfig')





router
    .route('/')
    //Index route

    .get(asyncWrap(async (req, response) => {
        console.log('req came to index');
        let getAllListingsQuery = `select * from product;`
        let db = await dbb();
        let [rows] = await db.query(getAllListingsQuery);
        //console.log(rows); //it is an array of objects
        let allListings = rows;

        db.end();

        //console.log(allListings);
        // console.log('Data retrieved successfully');
        response.render('listings/index.ejs', { allListings });

    }))

    //Insert listing route

    //upload.single('image') should place before validateListing

    .post(isLoggedIn, upload.single('image'), validateListing, couldinaryUpload, asyncWrap(async (req, res, err) => {
        console.log('req came to add a listing');
        //console.log(req.file);

        let { product_name, description, price, features, category } = req.body;
        //console.log(req.body);

        let db = await dbb();
        await db.query(
            'INSERT INTO Product (product_id , product_name , description  , image,  price , features , category) VALUES (? , ? , ? , ? , ? , ? , ?)',
            [uuidv4(), product_name, description, req.image, price, features, category]
        );

        let [rows] = await db.query(
            'SELECT * FROM Product WHERE product_name = ?',
            [product_name]
        );
        db.end();

        let newListing = rows[0];

        console.log('product added successfully\n', newListing);

        req.flash('success', 'Listing added successfully');
        console.log('Data inserted successfully');
        res.redirect(`/listings/${newListing.product_id}`);



    }))





//new route
router.get('/new', isLoggedIn, isAdmin , (req, res) => {

    res.render('listings/new.ejs');
});


//show route
router.get('/:id', currentUrl, asyncWrap(async (req, response) => {

    console.log('req came to show a listing');

    //console.log(req.user);

    let { id } = req.params;
    let db = await dbb();

    // let query = `Select product.* , Admin.admin_name   as owner , Admin.admin_id as owner_id from product  join Admin on Admin.admin_id = product.owner_id where product_id = '${id}';`;


    let query = `Select *  from product where product_id = '${id}';`;

    let [rows] = await db.query(query); // because in ejs :<p>Owner :  <i><%= listing.owner.username %></i></p>

    let listing = rows[0];
    let category = rows[0].category;
    if (!listing) {
        req.flash('error', 'Listing not found');
        return response.redirect('/listings');
    }

    query = `SELECT review.*, customer.* FROM review JOIN customer ON customer.customer_id = review.customer_id WHERE product_id = '${id}';`;


    [rows] = await db.query(query);
    let reviews = rows;

    query = `select * from product where category = '${category}';`;

    [rows] = await db.query(query);
    rows = rows.filter((product) => product.product_id !== id);
    let categoryProducts = rows;

    db.end();



    //console.log(features);

    // let reviews = await Listing.findById(id)
    //     .populate({
    //         path: 'reviews',
    //         populate: {
    //             path: 'author', // Path to populate within each review
    //         },
    //     });
    //console.log(reviews); //array of objects : [{}, {}, {}]
    //reviews = reviews.reviews;
    //reviews = [];
    //console.log(reviews);
    //console.log(reviews);
    response.render('listings/show.ejs', { listing, reviews , categoryProducts });
}));




router
    .route('/:id/edit')

    //Edit route

    .get(isLoggedIn, isAdmin, asyncWrap(async (req, res) => {
        let { id } = req.params;

        let query = `select * from product where product_id = '${id}';`;
        let db = await dbb();
        let [rows] = await db.query(query);
        let listing = rows[0];

        // let listing = await Listing.findById(id);
        // if (!listing) {
        //     req.flash('error', 'Listing not found');
        //     return res.redirect('/listings');
        // }
        // listing = [];
        res.render('listings/edit.ejs', { listing });
    }))

    //Update route

    .put(isLoggedIn, isAdmin, validateListing, asyncWrap(async (req, res) => {
        let { id } = req.params;
        let { product_name, description, price, features, category } = req.body;
        
        let query = `update product set product_name = '${product_name}' , description = '${description}' , price = '${price}' , features = '${features}' , category = '${category}' where product_id = '${id}';`;
        let db = await dbb();
        await db.query(query);

        db.end();

        req.flash('success', 'Listing updated successfully');
        console.log('Data updated successfully');
        res.redirect(`/listings/${id}`);
    }))




//Delete route
router.delete('/:id', isLoggedIn, isAdmin, asyncWrap(async (req, res) => {
    let { id } = req.params;

    let query = `delete from product where product_id = '${id}';`;
    let db = await dbb();
    await db.query(query);
    db.end();
    req.flash('success', 'Listing deleted successfully');
    console.log('Data deleted successfully');
    res.redirect('/admin/dashboard/manageProduct');

}))





module.exports = router;



