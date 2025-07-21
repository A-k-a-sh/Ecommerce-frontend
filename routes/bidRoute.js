const express = require('express');
const dbb = require('../init/sqlDbinitializer')

const { v4: uuidv4 } = require('uuid');
const router = express.Router();

const ExpressError = require('../ExpressError');


const asyncWrap = require('../utils/wrapAsync');

const isLoggedIn = require('../utils/isLoggedIn');

const currentUrl = require('../utils/currentUrl');
const isOwner = require('../utils/isOwner');
const { ro, fa } = require('@faker-js/faker');
const { route, post } = require('./listingRoute');

const isAdmin = require('../utils/isAdmin');

const isBidCanBePlaced = require('../utils/isBidCanBePlaced');



//bid by admin

router
    .route('/bidForm')
    .get(isAdmin , asyncWrap(async (req, res) => {
        let getAllListingsQuery = `select * from product;`
        let db = await dbb();

        let [rows] = await db.query(getAllListingsQuery);
        //console.log(rows); //it is an array of objects
        let allListings = rows;

        db.end();

        //console.log(allListings);

        //response.render('listings/index.ejs', { allListings, banner });
        res.render('listings/bidForm.ejs', { allListings });
    }))


    .post(isAdmin , isBidCanBePlaced, asyncWrap(async (req, res) => {
        if (req.bidRunning) {
            req.flash('error', 'A Bid is already running');
            return res.redirect('/listings');
        }

        let { listingId, startingPrice, timePeriod } = req.body;
        let bidId = uuidv4();

        if (!listingId) {
            req.flash('error', 'Please select a listing');
            return res.redirect('/bid/bidForm');
        }

        // Database connection
        let db = await dbb();

        // Construct SQL query with UNIX_TIMESTAMP()
        let query = `
            INSERT INTO bid 
            (Bid_id, admin_id, bid_date, starting_time, ending_time, bid_amount, product_id , status) 
            VALUES (?, ?, ?, UNIX_TIMESTAMP(), UNIX_TIMESTAMP() + ?, ?, ? , 'ON');
        `;

        let [rows] = await db.query(query, [bidId, req.user.admin_id, new Date(), timePeriod, startingPrice, listingId]);

        db.end();

        if (rows.affectedRows === 1) {
            req.flash('success', 'Bid placed successfully');
            res.redirect('/listings');
        } else {
            req.flash('error', 'Failed to place bid');
            res.redirect('/bid/bidForm');
        }
    }));





///bid by user/customer

router
    .route('/')
    .get(isLoggedIn , asyncWrap(async (req, res) => {
        let getAllBid = `select * from bid order by bid_date asc;`
        let db = await dbb();
        let [rows] = await db.query(getAllBid);
        if (rows.length === 0) {
            req.flash('error', 'No bids found');
            return res.redirect('/listings');
        }
        let bidDetails = rows[rows.length - 1];
        let query = `select * from product where product_id = ?;`

        let [rows2] = await db.query(query , [bidDetails.product_id]);
        let productDetails = rows2[0];

        const unixTimestamp = bidDetails.ending_time;

        const date = new Date(unixTimestamp * 1000); // Convert to milliseconds
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        bidDetails.ending_time = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

        // console.log('Product details: ', productDetails);
        // console.log('Bid details: ', bidDetails);

        let highestBidder = null;

        let highestBidderId = bidDetails.customer_id;

        if (highestBidderId) {
            let query2 = `select customer_name from customer where customer_id = '${highestBidderId}';`

            

            let [rows3] = await db.query(query2);
            highestBidder = rows3[0].customer_name;
            //console.log(rows3);

        }
        db.end();

        res.render('listings/bid.ejs', { bidDetails, productDetails, highestBidder });
    }))

    .post(isLoggedIn , isBidCanBePlaced, asyncWrap(async (req, res) => {
        if(req.bidTimeover){
            req.flash('error', 'Bid time is over');
            return res.redirect('/listings');
        }
        let getAllBid = `select * from bid order by bid_date asc;`
        let db = await dbb();
        let [rows] = await db.query(getAllBid);
        let latestBid = rows[rows.length - 1];
        let changeBidQuery = `update bid set bid_amount = ? , customer_id = ? where bid_id = ?;`
        let [rows2] = await db.query(changeBidQuery, [req.body.bidAmount, req.user.customer_id, latestBid.Bid_id]);
        db.end();
        req.flash('success', 'Bid placed successfully');

        res.redirect('/bid');
    }))






module.exports = router;

