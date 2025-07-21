const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const dbb = require('../init/sqlDbinitializer')
const { v4: uuidv4 } = require('uuid');


//const abc = require('../views/listings/login-registration.ejs');

const ExpressError = require('../ExpressError');
const asyncWrap = require('../utils/wrapAsync');

const User = require('../Models/Mongo model/userModelMongo');
const passport = require('passport');
const redirectUrl = require('../utils/redirectUrl');

const isLogOut = require('../utils/isLogOut');


router.get('/', (req, res) => {
    res.render('listings/login-registration');
})

router.post('/CustomerLogin',
    redirectUrl,
    passport.authenticate('customer-local', {  //local refers to the local authentication strategy provided by the passport-local module
        failureRedirect: '/loginSignup',
        failureFlash: true
    }),
    asyncWrap(async (req, res) => {

        //no need to collect data from req.body
        req.flash('success', 'Successfully Logged In');
        console.log(res.locals.redirectUrl);
        res.redirect(res.locals.redirectUrl || '/listings');

    })

)

router.post('/CustomerRegister', asyncWrap(async (req, res) => {
    try {
        let { email, password, username, confirmPassword } = req.body;

        // Validate passwords
        if (password !== confirmPassword) {
            req.flash('error', 'Passwords do not match');
            return res.redirect('/loginSignup');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const db = await dbb();
        const customerId = uuidv4();

        // Insert the new user into the database || register
        try {
            await db.query(
                'INSERT INTO Customer (customer_id, email, customer_name, password) VALUES (?, ?, ?, ?)',
                [customerId, email, username, hashedPassword]
            );
            console.log('Customer registered successfully');
        } catch (error) {
            req.flash('error', error.message);
            throw new ExpressError(error, 500);
        }

        // Fetch the registered user from the database
        const [rows] = await db.query('SELECT * FROM Customer WHERE email = ?', [email]);
        if (rows.length === 0) {
            req.flash('error', 'User not found after registration');
            return res.redirect('/loginSignup');
        }

        const registeredUser = rows[0];


        // Log in the newly registered user
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err); // Pass the error to the error handler
            }

            req.flash('success', 'Successfully Registered ');
            db.end();
            return res.redirect('/listings');
        });

    } catch (error) {
        req.flash('error', error.message);
        console.log(error.message);
        db.end();
        return res.redirect('/loginSignup');
    }

    
}))


//for both admin and customer
router.get('/logout', (req, res, next) => {

    //logout method provided by passport 
    console.log('holaaaa');

    res.locals.currentUser = req.user;
    req.logout(err => {
        if (err) return next(err);
    });
    req.flash('success', 'Successfully Logged Out'); //not working the flash msg
    res.redirect('/listings');

})

module.exports = router;


















router.post('/CustomerRegister', asyncWrap(async (req, res) => {
    try {

        let { email, password, username, confirmPassword } = req.body;
        if (password !== confirmPassword) {
            req.flash('error', 'Passwords do not match');
            return res.redirect('/CustomerloginSignup');
        }

        //


    } catch (error) {
        req.flash('error', error.message);
        res.redirect('/loginSignup');
    }
}))


router.post('/AdminRegister', asyncWrap(async (req, res) => {
    try {

        let { email, password, username, confirmPassword } = req.body;
        if (password !== confirmPassword) {
            req.flash('error', 'Passwords do not match');
            return res.redirect('/CustomerloginSignup');
        }

        //


    } catch (error) {
        req.flash('error', error.message);
        res.redirect('/loginSignup');
    }
}))