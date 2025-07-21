const express = require('express');
const {faker, da, ro} = require('@faker-js/faker');
const port = 8080;
const mysql = require('mysql2');

const app = express();
const {v4 : uuidv4} = require('uuid');
const dbb = require('./init/sqlDbinitializer')
const session = require('express-session');
const flash = require('connect-flash');

const passport = require('passport');
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local');
const methodOverride = require('method-override')


app.use(express.urlencoded({ extended: true })); //for post req sent from form
app.use(methodOverride('_method'))//using method override for patch,put,delete requests

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

//after session 
app.use(passport.initialize()); //initializing passport for each request
app.use(passport.session());






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

// Passport Local Strategy for Admin
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
// Serialize user


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



// Deserialize user
passport.deserializeUser(async (data, done) => {
    try {
        console.log(data);
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



app.post('/AdminRegister',async (req, res) => {
    let { email, password, username, confirmPassword } = req.body;
    if (password !== confirmPassword) {
        console.log('Passwords do not match');
        res.send('Passwords do not match');
    }
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

    const db = await dbb();
    try {
        await db.query(
            'INSERT INTO Admin (admin_id, email, admin_name, password) VALUES (?, ?, ?, ?)', 
            [uuidv4(), email, username, hashedPassword]
        );
        console.log('Admin registered successfully');
        res.send('Admin registered successfully');
    } catch (error) {
        res.send(`Error registering admin ${error}`);
    }
});


const isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.type === 'admin') {
        return next();
    }
    res.redirect('/loginSignup');
};


app.post('/AdminLogin', passport.authenticate('admin-local', {
    failureRedirect: '/loginSignup'
}) , 
async (req, res) => {
    console.log('Admin logged in');
    res.send('Admin logged in');
});

// app.get('/listings', (req, res) => {
//     res.send('Listings');
// })
app.get('/loginSignup' , (req , res) => {
    res.send('loginSignup');
})

app.get('/secret' ,isAdmin , (req , res) => {
    console.log('YOu are on secret page');
    res.send('YOu are on secret page');
})


app.get('/logout', (req, res , next) => {
    
    //logout method provided by passport 
    
    res.locals.currentUser = req.user;
    req.logout(err => {
        if(err) return next(err);
    });
    res.send('You are logged out');
    //res.redirect('/listings');
    
})



app.get('/listings',async (req, response) => {
    let query = `select * from product;`;
    let db = await dbb();
    let [rows] = await db.query(query);
   // console.log(rows); //it is an array of objects
    let allListings = rows;
    let banner = true
    // console.log('Data retrieved successfully');
    //response.render('listings/index.ejs', { allListings , banner });

})



app.get('/listings/:id', async (req, response) => {
    let { id } = req.params;
    let db = await dbb();
    let query = `Select product.* , Admin.admin_name as owner from product  join Admin on Admin.admin_id = product.owner_id where product_id = '${id}';`;

    let [rows] = await db.query(query);

    console.log(rows);
     // because in ejs :<p>Owner :  <i><%= listing.owner.username %></i></p>
    
});


app.listen(port , (req , res) => {
    console.log(`App started at port: ${port}`);
})