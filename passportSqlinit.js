
const {v4 : uuidv4} = require('uuid');
const dbb = require('./init/sqlDbinitializer')
const session = require('express-session');
const flash = require('connect-flash');

const passport = require('passport');
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local');

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

app.use(session(sessionConfig));

//after session 
app.use(passport.initialize()); //initializing passport for each request
app.use(passport.session());

const passportSqlInit = () => {
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
}

module.exports = passportSqlInit