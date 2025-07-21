if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');

const port = process.env.PORT || 8080;
const { faker, ne } = require('@faker-js/faker');

const methodOverride = require('method-override')
const engine = require('ejs-mate')

const ExpressError = require('./ExpressError');
const session = require('express-session');
const flash = require('connect-flash');

const { v4: uuidv4 } = require('uuid');
const dbb = require('./init/sqlDbinitializer')
const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./Models/Mongo model/userModelMongo');

const asyncWrap = require('./utils/wrapAsync')

const listingRouter = require('./routes/listingRoute');

const loginSignupRouter = require('./routes/loginSignupRoute');
const adminRouter = require('./routes/adminRoute');
const bidRouter = require('./routes/bidRoute');
const cartRouter = require('./routes/cartRoute');
const searchResult = require('./routes/searchRoute');
const catagoryRouter = require('./routes/catagoryRoute');
const paymentRouter = require('./routes/paymentRoute');
const reviewRouter = require('./routes/reviewRoute');
const profileRouter = require('./routes/profile');


const currentUrl = require('./utils/currentUrl');







app.set('view engine', 'ejs');
app.engine('ejs', engine); //for ejs mate
app.use(express.urlencoded({ extended: true })); //for post req sent from form
app.use(methodOverride('_method'))//using method override for patch,put,delete req
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());



const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}



app.use(session(sessionConfig));
app.use(flash());




//after session 
app.use(passport.initialize()); //initializing passport for each request
app.use(passport.session());

// Passport Local Strategy for Customer

passport.use('customer-local', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    try {
        const db = await dbb();
        // Query the Customer table
        const [rows] = await db.query('SELECT * FROM Customer WHERE email = ?', [email]);
        if (rows.length === 0) {
            return done(null, false, { message: 'Invalid email or password' });
        }
        const customer = rows[0];
        const isMatch = await bcrypt.compare(password, customer.password);
        if (!isMatch) {
            return done(null, false, { message: 'Invalid email or password' });
        }
        return done(null, customer);
    } catch (err) {
        return done(err);
    }
}));

// Passport Local Strategy for Admin || this is triggered when user wants to login by passport.authenticate()
passport.use('admin-local', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    try {
        // Query the Admin table
        const db = await dbb();

        const [rows] = await db.query('SELECT * FROM Admin WHERE email = ?', [email]);
        if (rows.length === 0) {
            return done(null, false, { message: 'Invalid email or password' });
        }
        const admin = rows[0];
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return done(null, false, { message: 'Invalid email or password' });
        }
        return done(null, admin);
    } catch (err) {
        return done(err);
    }
}));


// Serialize user || this is used to store user in session

passport.serializeUser((user, done) => {
    if (user.admin_id) {
        // Admin user: serialize using admin_id and type 'admin'
        done(null, { id: user.admin_id, type: 'admin' });
    } else if (user.customer_id) {
        // Customer user: serialize using customer_id and type 'customer'
        done(null, { id: user.customer_id, type: 'customer' });
    } else {
        done(new Error('Unknown user type')); // Handle the case where the user type is not recognized
    }
});



// Deserialize user || this is used to retrieve user from session || runs on every request
passport.deserializeUser(async (data, done) => {
    try {
        //console.log(data);
        const { id, type } = data;
        let query = '';
        if (type === 'admin') {
            query = 'SELECT * FROM Admin WHERE admin_id = ?';
        } else if (type === 'customer') {
            query = 'SELECT * FROM Customer WHERE customer_id = ?';
        }

        const db = await dbb();
        const [rows] = await db.query(query, [id]);
        if (rows.length === 0) {
            return done(null, false);
        }
        const user = rows[0];
        user.type = type; // Add type to user object
        return done(null, user);
    } catch (err) {
        done(err);
    }
});

//after session and flash || for flash messages

app.use((req, res, next) => {
    res.locals.successMsg = req.flash('success');
    res.locals.errorMsg = req.flash('error');


    //console.log(res.locals.successMsg);

    res.locals.currentUser = req.user;
    //console.log(res.locals);
    next();
})


//bid middleware

app.use(asyncWrap(async (req, res, next) => {
    let getAllBid = `select * from bid order by bid_date asc;`
    let db = await dbb();
    let [rows] = await db.query(getAllBid);
    res.locals.banner = false;

    if (rows.length === 0) {
        res.locals.banner = false;
        return next();
    }

    let latestBid = rows[rows.length - 1];

    // //console.log(latestBid);

    const bidEndingTime = latestBid.ending_time;
    const bidStatus = latestBid.status;
    const currentTime = Math.floor(Date.now() / 1000); // Convert to milliseconds

    if (bidEndingTime <= currentTime && bidStatus === 'ON') {
        res.locals.banner = false;

        await db.query(
            `Update bid set status = 'OFF' where bid_id = ?;`,
            [latestBid.Bid_id]
        )

        if (!latestBid.customer_id) {
            return next();
        }

        let customerId = latestBid.customer_id;
        let productId = latestBid.product_id;
        let amount = latestBid.bid_amount;
        await db.query(
            `Update product set price = ? where product_id = ?;`,
            [amount, productId]
        )
        await db.query(
            'INSERT INTO cart ( product_id , customer_id , quantity) VALUES ( ? , ? , ?)',
            [productId, customerId, 1]
        );



    }
    //console.log(res.locals.banner);
    if (bidEndingTime <= currentTime) res.locals.banner = false;

    else {
        res.locals.banner = true;

    }

    next()
}))


//this two should be after session and flash
app.use('/listings', listingRouter);
app.use('/listings/:id/reviews', reviewRouter);
app.use('/loginSignup', loginSignupRouter);
app.use('/admin', adminRouter);
app.use('/bid', bidRouter);
app.use('/cart', cartRouter);
app.use('/searchResult', searchResult);
app.use('/catagoryProducts', catagoryRouter);
app.use('/checkout', paymentRouter);
app.use('/:id/reviews', reviewRouter);
app.use('/profile', profileRouter);


app.get('/', (req, res) => {
    res.render('listings/home.ejs');
})



app.get('/searchItem', (req, res) => {
    res.render('listings/searchItem.ejs');
})

app.get('/faq', (req, res) => {
    res.render('listings/faq.ejs');
})










app.use((req, res, next) => {
    throw new ExpressError('Page Not Found', 404);
});

app.use((err, req, res, next) => {
    console.log('hola from error middleware');
    console.log(err);
    const { message = 'Something went wrong', statusCode = 500 } = err;
    res.status(statusCode).render('listings/notFound.ejs', { message, statusCode });
})



app.listen(port, (req, res) => {
    console.log(`App started at port: ${port}`);
})