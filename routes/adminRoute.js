const express = require('express');
const router = express.Router();


const ExpressError = require('../ExpressError');
const asyncWrap = require('../utils/wrapAsync');

const passport = require('passport');
const redirectUrl = require('../utils/redirectUrl');

const isLogOut = require('../utils/isLogOut');

const dbb = require('../init/sqlDbinitializer');
const isAdmin = require('../utils/isAdmin');


router
    .route('/login')
    .get((req, res) => {
        res.render('listings/adminSignup.ejs');
    })

    .post(passport.authenticate('admin-local',
        {
            failureRedirect: '/admin/login',
            failureFlash: true
        }),
        asyncWrap(async (req, res) => {
            req.flash('success', 'Successfully Logged In as Admin');
            res.redirect('/listings');

        }))

router.get('/dashboard/manageProduct', isAdmin, asyncWrap(async (req, res) => {
    let getAllListingsQuery = `select * from product;`
    let db = await dbb();
    let [rows] = await db.query(getAllListingsQuery);
    //console.log(rows); //it is an array of objects
    let allListings = rows;

    db.end();
    res.render('listings/adminDashboard/manageProduct.ejs', { allListings });
}))



router.get('/dashboard/addBid', isAdmin, asyncWrap(async (req, res) => {
    let getAllListingsQuery = `select * from product;`
    let db = await dbb();

    let [rows] = await db.query(getAllListingsQuery);
    //console.log(rows); //it is an array of objects
    let allListings = rows;

    db.end();
    res.render('listings/adminDashboard/addBid.ejs', { allListings });
}))



router.get('/dashboard/addProduct', isAdmin, asyncWrap(async (req, res) => {
    res.render('listings/adminDashboard/addProduct.ejs');
}))



router.get('/dashboard/editProduct/:id', isAdmin, asyncWrap(async (req, res) => {
    let { id } = req.params;

    let query = `select * from product where product_id = '${id}';`;
    let db = await dbb();
    let [rows] = await db.query(query);
    let listing = rows[0];

    res.render('listings/adminDashboard/editProduct.ejs', { listing });
}))

module.exports = router;

