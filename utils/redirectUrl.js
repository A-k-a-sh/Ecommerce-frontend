module.exports = redirectUrl = (req, res, next) => {
    //console.log(req.originalUrl);
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    else{
        res.locals.redirectUrl = req.session.currentUrl
        
    }
    
    next();
}