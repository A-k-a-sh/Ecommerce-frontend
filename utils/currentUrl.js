module.exports = currentUrl = (req, res, next) => {
    req.session.currentUrl = req.originalUrl
    next();
}