
const Review = require('../Mongo model/reviewsModelMongo');
const mongoose = require('mongoose');


const linstingSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true
    },
    description : String,
    image : {
        filename : {
            type : String,
            default : 'img'
        },
        url : {
            type : String,
            default : 'https://ln.run/gdkot',
            set : (val) =>  val === '' ? 'https://ln.run/gdkot' : val
        }
    },

    price : Number,
    location : String,
    country : String,
    reviews : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Review'
        }
    ],
    owner : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    }

});

initializer = () => {
    main = async () => {
        await mongoose.connect('mongodb://127.0.0.1:27017/myDatabase1'); // myDatabase1 is database name
    }
    
    main()
    .then((res) => { 
        console.log('connected'); 
    })
    .catch((err) => { 
        console.log(err); 
    })
}


linstingSchema.post('findOneAndDelete' , async(listing) => {
    if(listing.reviews.length > 0) {
        await Review.deleteMany({_id : {$in : listing.reviews}});
    }
})

const Listing = mongoose.model('Listing' , linstingSchema);

module.exports = {Listing , initializer};