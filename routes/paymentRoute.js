const express = require('express');
const dbb = require('../init/sqlDbinitializer')
const dotenv = require('dotenv');
dotenv.config();

const { v4: uuidv4 } = require('uuid');
const router = express.Router();

const ExpressError = require('../ExpressError');


const asyncWrap = require('../utils/wrapAsync');

const isLoggedIn = require('../utils/isLoggedIn');

const currentUrl = require('../utils/currentUrl');
const isOwner = require('../utils/isOwner');
const { ro, fa } = require('@faker-js/faker');
const { route, post } = require('./listingRoute');
const validatePayment = require('../utils/validatePayment');





const SSLCommerzPayment = require('sslcommerz-lts')
const store_id = process.env.STORE_ID
const store_passwd = process.env.STORE_PASS
const is_live = false



router
    .route('/')
    .get(isLoggedIn, asyncWrap(async (req, res) => {



        let query = `select product.* , quantity , customer.* from cart join product on product.product_id = cart.product_id join customer on customer.customer_id = cart.customer_id where cart.customer_id = '${req.user.customer_id}';`
        let db = await dbb();
        let [rows] = await db.query(query);

        let AllInfos = rows;


        if (AllInfos.length === 0) {
            req.flash('error', 'Your cart is empty');
            return res.redirect('/cart');
        }
        let totalPrice = 0;
        AllInfos.forEach((info) => {
            totalPrice += info.price * info.quantity
        })
        //console.log(AllInfos);

        db.end();

        res.render('listings/checkout.ejs', { AllInfos, totalPrice });
    }))


    .post(validatePayment, asyncWrap(async (req, res) => {


        const payment_id = uuidv4();
        const { customer_name : name, phone:  phone_number, address, city, totalAmount : total } = req.body;


        //create temporary session

        req.session.PaymentInfo = {
            payment_id,
            name,
            phone_number,
            address,
            city,
            total_amount : total
        }

        

        const id = uuidv4();

        const orderInfo = req.body;
        const data = {
            total_amount: total,
            currency: 'BDT',
            tran_id: id, // use unique tran_id for each api call
            success_url: `http://localhost:3000/checkout/success/${payment_id}`,
            fail_url: 'http://localhost:3000/checkout/fail',
            cancel_url: 'http://localhost:3000/cancel',
            ipn_url: 'http://localhost:3000/ipn',
            shipping_method: 'Courier',
            product_name: 'Computer.',
            product_category: 'Electronic',
            product_profile: 'general',
            cus_name: 'Customer Name',
            cus_email: 'customer@example.com',
            cus_add1: 'Dhaka',
            cus_add2: 'Dhaka',
            cus_city: 'Dhaka',
            cus_state: 'Dhaka',
            cus_postcode: '1000',
            cus_country: 'Bangladesh',
            cus_phone: '01711111111',
            cus_fax: '01711111111',
            ship_name: 'Customer Name',
            ship_add1: 'Dhaka',
            ship_add2: 'Dhaka',
            ship_city: 'Dhaka',
            ship_state: 'Dhaka',
            ship_postcode: 1000,
            ship_country: 'Bangladesh',
        };


        const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)


        sslcz.init(data).then(apiResponse => {
            // Redirect the user to payment gateway
            let GatewayPageURL = apiResponse.GatewayPageURL
            res.redirect(GatewayPageURL)

            console.log('Redirecting to: ', GatewayPageURL)
        });


        

        // res.redirect(`/checkout/${payment_id}`);


    }))

router.post(
    '/success/:payment_id',
    asyncWrap(async (req, res) => {
        let payment_id = req.params.payment_id; // You used `req.query`, but it should be `req.params`
        res.redirect(`/checkout/${payment_id}`);
    })
);

router
    .route('/:payment_id')
    .get(isLoggedIn, asyncWrap(async (req, res) => {

        const { payment_id } = req.params
        let customer_id = req.user.customer_id;

        let query = `INSERT INTO payment (payment_id , name , phone_number ,address , city, total_amount) VALUES (? , ? , ? , ? , ? , ?)`;

        //create temporary session


        let db = await dbb();

        let {name, phone_number, address, city, total_amount } = req.session.PaymentInfo

        // console.log(req.session.PaymentInfo);

        let [rows] = await db.query(query, [payment_id, name, phone_number, address, city, total_amount]);


        console.log(rows);

        query = ` select * from cart where customer_id = '${customer_id}';`;

        [rows] = await db.query(query);

        rows.forEach(async (row) => {
            query = `INSERT INTO paymentCart (payment_id , product_id , customer_id , quantity ) VALUES ( ? , ? , ? , ? )`;
            await db.query(query, [payment_id, row.product_id, customer_id, row.quantity]);
        })

        req.session.PaymentInfo = null

        // Query to get product details
        query = `
            SELECT 
                pc.payment_id, 
                c.customer_name, 
                p.product_name, 
                p.price, 
                pc.quantity, 
                (p.price * pc.quantity) AS total_price
            FROM 
                paymentcart pc
            JOIN 
                customer c ON pc.customer_id = c.customer_id
            JOIN 
                product p ON pc.product_id = p.product_id
            WHERE 
                pc.payment_id = ?;
        `;

        // Query to get the total amount
        const query2 = `
            SELECT total_amount 
            FROM payment 
            WHERE payment_id = ?;
        `;


        // Execute queries
        [rows] = await db.query(query, [payment_id]);
        [rows2] = await db.query(query2, [payment_id]);

        // Ensure results exist
        if (!rows || rows.length === 0) {
            return res.status(404).send("Invoice not found.");
        }

        const NeetTotalAmount = rows2[0]?.total_amount || 0;
        const totalAmount = rows.reduce((sum, item) => sum + item.total_price, 0);
        const deliveryFee = NeetTotalAmount - totalAmount;

        db.end();


        res.render('listings/invoice.ejs', {
            customerName: rows[0]?.customer_name || 'Unknown',
            items: rows,
            totalAmount,
            deliveryFee
        });

        req.flash('success', 'Order placed successfully');
    }));









module.exports = router;



// res = {
//     customer_name: 'cde',
//     phone: '03289832',
//     address: 'dsfsd',
//     email: 'cde@gmail.com',
//     city: 'Chittagong',
//     totalAmount: '20364'
// }