module.exports = isLogOut = (req, res, next) => {
    res.locals.isLogOut = 'Logged Out successfully';
    next();
}