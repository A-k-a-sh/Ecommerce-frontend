const { required } = require('joi');
const mongoose = require('mongoose');
const { use } = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
    email : {
        type : String,
        unique : true,
        required : true
    },
    //Passport-Local Mongoose will add a username, hash and salt field to store the username, the hashed password and the salt value. so we don't need to add them
})

userSchema.plugin(passportLocalMongoose); //this will add the username, hash and salt field

const User = mongoose.model('User' , userSchema);

module.exports = User;