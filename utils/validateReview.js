const ExpressError = require('../ExpressError');
const { JoiReviewSchema } = require('../JoiSchema');

//JOi schema validation middleware

const validateReview = (req, res, next) => {
    const result = JoiReviewSchema.validate(req.body);
    //console.log(result);
    if (result.error) {
        let errMsg = result.error.details.map(el => el.message).join(','); //to get all the error messages || not necessary but can be used
        throw new ExpressError(errMsg, 400);//or we can simply send result.error
    }
    else {
        next();
    }
}

module.exports = validateReview