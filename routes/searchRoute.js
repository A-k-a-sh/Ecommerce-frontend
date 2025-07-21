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
        //console.log(req.query);
        let { searchQuery } = req.query;

        let db = await dbb();

        let query = `select * from product where product_name regexp '${searchQuery}'`

        let [rows] = await db.query(query);
        //console.log(rows);

        let products = rows;

        db.end();


        res.render('listings/searchResult.ejs', { searchQuery , products  });
    }))




module.exports = router;