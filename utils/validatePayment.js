const ExpressError = require('../ExpressError');
const { JoiPaymentSchema } = require('../JoiSchema');


//JOi schema validation middleware

const validatePayment = (req, res, next) => {
    console.log('validating listing middleware executed' );
    //console.log(req.body);
    const result = JoiPaymentSchema.validate(req.body);
    //console.log(result);
    if (result.error) {
        let errMsg = result.error.details.map(el => el.message).join(','); //to get all the error messages || not necessary but can be used
        throw new ExpressError(errMsg, 400);//or we can simply send result.error
    }
    else {
        console.log('validating listing middleware passed' );
        next();
    }
}


module.exports = validatePayment