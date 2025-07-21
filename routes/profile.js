const express = require('express');
const dbb = require('../init/sqlDbinitializer')
const dotenv = require('dotenv');
dotenv.config();

const { v4: uuidv4 } = require('uuid');
const router = express.Router();

const ExpressError = require('../ExpressError');


const asyncWrap = require('../utils/wrapAsync');

const isLoggedIn = require('../utils/isLoggedIn');
const bcrypt = require('bcrypt');

const currentUrl = require('../utils/currentUrl');
const isOwner = require('../utils/isOwner');
const { ro, fa } = require('@faker-js/faker');
const { route, post } = require('./listingRoute');
const validatePayment = require('../utils/validatePayment');


router
    .get('/user',isLoggedIn , asyncWrap(async (req, res) => {
        console.log('Req came to profile');
        let db = await dbb();
        const user = req.user;
        console.log(user);
        let query = ``
        res.render('listings/profile/profile' ,{user});
    }))
    .get('/setPassword' , isLoggedIn , asyncWrap(async (req, res) => {
        console.log('Req came to set password');
        res.render('listings/profile/SetPassWord');
    }))

    .get('/purchasehistory' , isLoggedIn , asyncWrap(async (req, res) => {
        console.log('Req came to purchase history');
        const db = await dbb();
        try {
        const [rows] = await db.query(`
            SELECT p.* 
            FROM paymentcart pc
            JOIN product p ON pc.product_id = p.product_id
            WHERE pc.customer_id = ?`, [req.user.customer_id]);
            allproducts = rows
         // returns product details in the cart
         res.render('listings/profile/PurchaseHistory' , { allproducts });
    } catch (error) {
        console.error('Error fetching cart products:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        db.end();
    }
        
    }))





    .post('/updateName', isLoggedIn , asyncWrap(async (req, res) => {
        console.log('Req came to update name');
        let {updatedName} = req.body;
        let db = await dbb();
        let query = `update customer set customer_name = '${updatedName}' where customer_id = '${req.user.customer_id}'`;
        await db.query(query);
        db.end();
        res.redirect('/profile/user');
    }))

    .post('/updateAddress' , isLoggedIn , asyncWrap(async (req, res) => {
        console.log('Req came to update address');
        let {updatedAddress} = req.body;
        let db = await dbb();
        let query = `update customer set address = '${updatedAddress}' where customer_id = '${req.user.customer_id}'`;
        await db.query(query);
        db.end();
        res.redirect('/profile/user');
    }))


    .post('/updateNumber' , isLoggedIn , asyncWrap(async (req, res) => {
        console.log('Req came to update number');
        let {updatedNumber} = req.body;
        let db = await dbb();
        let query = `update customer set phone_number = '${updatedNumber}' where customer_id = '${req.user.customer_id}'`;
        await db.query(query);
        db.end();
        res.redirect('/profile/user');
    }))


    .post('/updatePassword', isLoggedIn, asyncWrap(async (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const customerId = req.user.customer_id; // Or however you store logged-in user info

    console.log(oldPassword , newPassword , confirmPassword);

    const db = await dbb();

    try {
        // 1. Fetch the current hashed password from DB
        const [rows] = await db.query('SELECT password FROM Customer WHERE customer_id = ?', [customerId]);

        if (rows.length === 0) {
            req.flash('error', 'User not found');
            return res.redirect('/profile/setPassword'); // Or your settings page
        }

        const currentHashedPassword = rows[0].password;

        // 2. Compare old password with stored hashed password
        const isMatch = await bcrypt.compare(oldPassword, currentHashedPassword);
        if (!isMatch) {
            console.log('Incorrect current password');
            return res.status(400).json({ error: 'Incorrect current password' });
        }

        // 3. Check if new passwords match
        if (newPassword !== confirmPassword) {
            req.flash('error', 'New passwords do not match');
            return res.status(400).json({ error: 'New passwords do not match' });
        }

        // 4. Hash the new password and update DB
        const newHashedPassword = await bcrypt.hash(newPassword, 10);
        await db.query('UPDATE Customer SET password = ? WHERE customer_id = ?', [newHashedPassword, customerId]);

        // req.flash('success', 'Password updated successfully');
        return res.json({ success: 'Password updated successfully' });
    } catch (err) {
        console.error(err);
        req.flash('error', 'Something went wrong');
        return res.status(400).json({ error: 'Something went wrong' });
    } finally {
        db.end();
    }
}));


module.exports = router;