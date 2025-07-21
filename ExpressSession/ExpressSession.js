const express = require('express');
const app = express();

const session = require('express-session');

app.use(session({
    secret: 'mysupersecretkey',
    resave: false,
    saveUninitialized: true
}));

app.get('/', (req, res) => {
    if (req.session.count) {
        req.session.count++;
    } else {
        req.session.count = 1;
    }
    res.send(`You have visited this page ${req.session.count} times`);
});

app.get('/register', (req, res) => {
    let {name = 'Anonymous'} = req.query;
    req.session.name = name; //we can create different session variables
    res.redirect('/greet');
})

app.get('/greet', (req, res) => {
    res.send(`Hello ${req.session.name}`);
})

app.listen(3000, () => {
    console.log('Server started on port 3000');
});