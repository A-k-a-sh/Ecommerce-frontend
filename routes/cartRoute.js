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
        console.log('Get req in /cart');

        if (!req.user) {
            req.flash('error', 'You need to login first');
            return res.redirect('/loginSignup');
        }

        let query = `select product.* , quantity from cart  join product on product.product_id = cart.product_id where cart.customer_id = '${req.user.customer_id}';`
        let db = await dbb();
        let [rows] = await db.query(query);
        let Products = rows;

        let price = 0;

        if (Products.length) {
            Products.forEach(p => {
                price += p.price * p.quantity;
            })
        }

        db.end();

        //let Products  = [''];

        res.render('listings/cart.ejs', { Products, price });
    }))



router.post('/:id', asyncWrap(async (req, res) => {
    console.log('Post req in /cart');

    if (!req.user) {
        req.flash('error', 'You need to login first');
        return res.redirect('/loginSignup');
    }
    let { id } = req.params;
    let { quantity } = req.body;
    let customer_id = req.user.customer_id;

    //console.log(id , quantity , customer_id);

    let db = await dbb();

    let query = `select * from cart where product_id = ? and customer_id = ?`

    let [rows] = await db.query(query, [id, customer_id]);

    if (rows.length) {
        query = `UPDATE cart SET quantity = '${quantity}' WHERE product_id = '${id}' AND customer_id = '${customer_id}';`;
        await db.query(query);
        return res.redirect('/cart');
    }

    await db.query(
        'INSERT INTO cart ( product_id , customer_id , quantity) VALUES ( ? , ? , ?)',
        [id, customer_id, quantity]
    );

    db.end();
    res.redirect('/cart');
}))


router.get('/remove/:id', asyncWrap(async (req, res) => {
    console.log('Req came in /cart/remove');

    let { id } = req.params;
    let customer_id = req.user.customer_id;

    let query = `delete from cart where product_id = ? and customer_id = ?`
    let db = await dbb();
    await db.query(query, [id, customer_id]);

    db.end();
    req.flash('success', 'Item removed successfully')
    res.redirect('/cart');

}))







module.exports = router