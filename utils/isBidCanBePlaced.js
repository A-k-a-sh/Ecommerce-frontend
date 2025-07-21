const asyncWrap = require('./wrapAsync');
const dbb = require('../init/sqlDbinitializer');

const isBidCanBePlaced = asyncWrap(async (req, res, next) => {
    let getAllBid = `select * from bid order by bid_date asc;`
    let db = await dbb();
    let [rows] = await db.query(getAllBid);
    req.bidTimeover = false;
    req.bidRunning = false;

    if (rows.length === 0) {
        req.bidRunning = false;
        req.bidTimeover = true;
        return next();
    }

    let latestBid = rows[rows.length - 1];

    const bidEndingTime = latestBid.ending_time;
    const currentTime = Math.floor(Date.now() / 1000); // Convert to milliseconds

    if (bidEndingTime <= currentTime) {
        req.bidRunning = false;
        req.bidTimeover = true;
        return next();
    }
    else {
        req.bidTimeover = false;
        req.bidRunning = true;
        return next();
    }
});

module.exports = isBidCanBePlaced;