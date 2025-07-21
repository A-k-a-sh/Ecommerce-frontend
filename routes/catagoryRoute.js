const express = require('express');
const path = require('path');
const dbb = require('../init/sqlDbinitializer')

const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const ExpressError = require('../ExpressError');


const asyncWrap = require('../utils/wrapAsync');

const isLoggedIn = require('../utils/isLoggedIn');

const currentUrl = require('../utils/currentUrl');


router
    .route('/')
    .get(asyncWrap(async (req, res) => {

        console.log('req came to get Catagory Route');
        let {catagory} = req.query;
        console.log('catagory: ' +catagory);
        let db = await dbb();
        let query = `select * from product where category = '${catagory}';`
        let [rows] = await db.query(query);
        let products = rows;

        db.end();
        //console.log(products);
        res.render('listings/catagoryProducts.ejs', {products});
        //res.render('listings/catagoryProducts.ejs');
    }))



module.exports = router;