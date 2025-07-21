const isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.type === 'admin') {
        return next();
    }
    req.flash('error', 'You are not an admin');
    res.redirect('/admin/login');
};

module.exports = isAdmin;