app.post('/CustomerLogin',
    redirectUrl,
    passport.authenticate('customer-local', {  
        failureRedirect: '/loginSignup',
        failureFlash: true
    }),
    asyncWrap(async (req, res) => {

        //no need to collect data from req.body
        req.flash('success', 'Successfully Logged In');
        res.redirect(res.locals.redirectUrl || '/listings');

    })

)