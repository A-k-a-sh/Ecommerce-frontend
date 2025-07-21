const Review = require('../Models/Mongo model/reviewsModelMongo');
const wrapAsync = require('./wrapAsync');

module.exports = isReviewOwner = wrapAsync(async(req, res, next) => {

    let { id , reviewId} = req.params;

    let review = await Review.findById(reviewId);
    if(req.user &&  !review.author.equals(req.user._id)) {
        req.flash('error', 'You are not the author of this review');
        return res.redirect(`/listings/${id}`);
    }
    next();
})