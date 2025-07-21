const express = require('express');
const app = express();
const port = 3000;
const flash = require('connect-flash');
const session = require('express-session');
const path = require('path');

app.set('views' , path.join(__dirname , 'views'));
app.set('view engine' , 'ejs');
app.use(flash());
app.use(session({
    secret: 'mysupersecretkey',
    resave: false,
    saveUninitialized: true
}));

app.use((req , res , next) => {
    res.locals.successMsg = req.flash('success');
    res.locals.errorMsg = req.flash('error');
    next();
})

app.get('/register', (req, res) => {
    let {name = 'Anonymous'} = req.query;
    req.session.name = name; //we can create different session variables

    if(name === 'Anonymous') {
        req.flash('error' , 'You are not registered'); //key val pair
    }
    else{
        req.flash('success' , 'You are registered');
    }

    res.redirect('/greet');
})

app.get('/greet', (req, res) => {
    res.render('showflashMessage' , { name: req.session.name }); //now we don't need to send the val explicitly
})

app.listen(port , () => {
    console.log(`App started at port ${port}`);
})