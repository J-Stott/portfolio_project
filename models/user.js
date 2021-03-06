const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const passport = require("passport");

//setup user schema
const userSchema = new mongoose.Schema({
    username: { type : String , unique : true, required : true, dropDups: true },
    displayName: { type : String },
    email: { type : String , unique : true, required : true, dropDups: true },
    profileImg: {type: String, default: "/profileImages/default.png"}
});

userSchema.plugin(passportLocalMongoose, {
    usernameQueryFields: ["email"],
    usernameLowerCase: true
});

const User = mongoose.model("User", userSchema);

//passport setup - serialise functions are more general
passport.use(User.createStrategy());
passport.serializeUser(function(user, done){
    done(null, user.id);
});
passport.deserializeUser(function(id, done){
    User.findById(id, function(err, user){
        done(err, user);
    });
});

module.exports = User;