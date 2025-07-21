const {Listing} = require('../Models/Mongo model/listingMongo');
const wrapAsync = require('./wrapAsync');

module.exports = isOwner = wrapAsync(async(req, res, next) => {

    let { id } = req.params;

    let listing = await Listing.findById(id);
    if(req.user &&  !listing.owner.equals(req.user._id)) {
        req.flash('error', 'You are not the owner of this listing');
        return res.redirect(`/listings/${id}`);
    }
    next();
})