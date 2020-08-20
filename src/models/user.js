const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const passport = require("passport");

//setup user schema
const userSchema = new mongoose.Schema({
    username: { type : String , unique : true, required : true, dropDups: true },
    displayName: { type : String },
    email: { type : String , unique : true, required : true, dropDups: true },
    profileImg: {type: String, default: "/profileImages/default.png"},
    bio: {type: String},
    numReviews: {type: Number, default: 0},
    roles: [{type: String, enum: ["user", "admin", "super_admin"], default: ["user"]}] 
});

//allow user to also use email to login
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

async function updateReviewCount(user, increase){
    if(increase){
        user.numReviews++;
    } else {
        user.numReviews--;
    }

    user.save();
}

function isSuperAdmin(user){
    return user.roles.includes("super_admin");
}

function isAdmin(user){
    return user.roles.includes("super_admin") || user.roles.includes("admin");
}

module.exports = {
    model: User,
    isAdmin: isAdmin,
    isSuperAdmin: isSuperAdmin,
    updateReviewCount: updateReviewCount
};