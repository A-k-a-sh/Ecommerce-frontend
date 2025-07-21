
const isLoggedIn = (req, res, next) => {
    // Check if the user is authenticated
    if (req.isAuthenticated()) {
        return next(); // Proceed to the next middleware/route handler
    }

    // Determine the redirect URL for later
    let newUrl = req.originalUrl;
    if (req.originalUrl.includes('/reviews/')) {
        newUrl = req.originalUrl; // Keep the full URL if it matches this condition
    } else if (req.originalUrl.includes('/reviews')) {
        newUrl = req.originalUrl.replace('/reviews', '');
    }
    req.session.redirectUrl = newUrl;

    // Notify the user and redirect to login
    req.flash('error', 'You must be logged in');
    return res.redirect('/loginSignup');
};

module.exports = isLoggedIn;

