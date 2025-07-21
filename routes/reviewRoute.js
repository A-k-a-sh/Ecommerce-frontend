const express = require('express');
const dbb = require('../init/sqlDbinitializer')

const { v4: uuidv4 } = require('uuid');
const router = express.Router({mergeParams : true});//to get id from listing

const ExpressError = require('../ExpressError');



const asyncWrap = require('../utils/wrapAsync');

const isLoggedIn = require('../utils/isLoggedIn');

const currentUrl = require('../utils/currentUrl');
const isOwner = require('../utils/isOwner');
const { ro, fa } = require('@faker-js/faker');
const { route, post } = require('./listingRoute');
const validatePayment = require('../utils/validatePayment');



router
    .route('/')
    

    .post(isLoggedIn , asyncWrap(async (req, res) => {
        console.log('Req came to add a review');
        let {id} = req.params;
        let { rating , comment } = req.body;
        let query = `insert into review (review_id , product_id , customer_id , review , rating) values (uuid() ,'${id}' , '${req.user.customer_id}' , '${comment}' , '${rating}')`;
        let db = await dbb();
        await db.query(query);

        db.end();
        req.flash('success', 'Review added successfully');
        res.redirect(`/listings/${id}`);
        
    }))


router.get('/:review_id' , isLoggedIn , asyncWrap(async (req, res) => {
    console.log('Req came to delete review');
    let {id , review_id} = req.params;
    let db = await dbb();

    let query = `delete from review where review_id = '${review_id}'`;
    await db.query(query);

    db.end();

    req.flash('success', 'Review deleted successfully');
    res.redirect(`/listings/${id}`);
}))





module.exports = router;

