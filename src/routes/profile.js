const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Review = require("../models/review");
const Draft = require("../models/draft");
const Game = require("../models/game");
const Discussion = require("../models/discussion");
const Reaction = require("../models/reaction");
const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const settings = require("../../settings");
let upload = require("../components/profile_uploader");

function checkMatch(userData, username){
    if(userData.username === username || User.isAdmin(userData)){
        return true;
    }

    return false;
}

//checks if an error message exists and adds it to data sent to rendered page
function checkAndSetMessage(session, data, key){
    if (session[key] !== null) {
        data[key] = session[key];
        session[key] = null;
    }
}

function deleteProfileImage(foundUser) {
    if (foundUser.profileImg !== settings.DEFAULT_PROFILE_IMG) {
        const fileName = path.join(settings.PROJECT_DIR, "public", foundUser.profileImg);

        fs.unlink(fileName, (err) => {
            if (err) {
                console.error(err);
            }
        });
    }
}

router.get("/:username", async function (req, res) {

    try {
        if (req.isAuthenticated()) {
            const username = _.toLower(req.params.username);
            const user = req.user;
    
            if(!checkMatch(user, username)){
                res.redirect("/");
            } else {
    
                let foundUser = await User.model.findOne({username: username}).exec();

                if (!foundUser){
                    res.redirect("/");
                } else {
                    const data = {
                        user: user,
                        profile: foundUser
                    }

                    checkAndSetMessage(req.session, data, "userMessage");
                    checkAndSetMessage(req.session, data, "imageMessage");
                    checkAndSetMessage(req.session, data, "passwordMessage");
                    checkAndSetMessage(req.session, data, "successMessage");
            
                    res.render("profile", data);
                }
            }
        } else {
            res.redirect("/login");
        }
    } catch(err) {
        console.log(err);
    }
    
});

//updates user avatar provided they have sent a valid file
router.post("/:username/updateImage", upload.single("profile"), async function (req, res) {
    try {
        if (req.isAuthenticated()) {
            const username = _.toLower(req.params.username);
            const user = req.user;
            //check if we have been given an appropriate file
    
            if(!checkMatch(user, username)){
                res.redirect("/");
            } else {
    
                if (!req.file) {
                    req.session.imageMessage = "Please provide a valid file. (.jpeg/.png)";
                    res.redirect(`/profile/${username}`);
                } else {
                    //update user profile path
                    const file = req.file;
                    let foundUser = await User.model.findOne({username: username}).exec(); 
                    const profileImgName = "/profileImages/" + file.filename;

                    //delete their previous image from the server
                    if(profileImgName !==  foundUser.profileImg){
                        deleteProfileImage(foundUser);
                    }
                    
                    foundUser.profileImg = profileImgName;
                    await foundUser.save();
                    req.session.successMessage = "Profile image updated successfully";
                    res.redirect(`/profile/${username}`);
                }
            }
    
        } else {
            res.redirect("/login");
        }
    } catch(err) {
        console.log(err);
    }

});

//updates user profile information
router.post("/:username/updateInfo", async function (req, res) {
    try {
        if (req.isAuthenticated()) {
            const username = _.toLower(req.params.username);
            const user = req.user;
    
            if(!checkMatch(user, username)){
                res.redirect("/");
            } else {
    
                const displayName = req.body.displayName;
                const bio = req.body.bio;
    
                let foundUser = await User.model.findOne({username: username}).exec(); 

                //double check they have given us an appropriate name
                const lowerFormName = _.toLower(displayName);
    
                if (foundUser.username !== lowerFormName) {
                    req.session.userMessage = "Entered name does not match your username";
                    res.redirect(`/profile/${username}`);
                } else {
                    foundUser.displayName = displayName;
                    foundUser.bio = bio;
                    await foundUser.save();
                    req.session.successMessage = "Profile info updated successfully";
                    res.redirect(`/profile/${username}`);
                }
            }   
        } else {
            res.redirect("/login");
        }
    } catch(err) {
        console.log(err);
    }
    
});


//clear out all user data
router.post("/:username/updatePassword", async function (req, res) {

    try {
        if(req.isAuthenticated()){
            const username = _.toLower(req.params.username);
            const user = req.user;
    
            if(!checkMatch(user, username)){
                res.redirect("/");
            } else {
                let foundUser = await User.model.findOne({username: username}).exec();

                foundUser.changePassword(req.body.oldPassword, req.body.newPassword, function(err){
                    if(err){
                        console.log(err);
                        req.session.passwordMessage = "Your old password is incorrect";
                        res.redirect(`/profile/${username}`);
                    } else {
                        req.session.successMessage = "Password updated successfully";
                        res.redirect(`/profile/${username}`);
                    }
                });
            }
            
        } else {
            res.redirect("/login");
        }
    } catch(err) {
        console.log(err);
    }

});

//clear out all user data
router.post("/:username/delete", async function (req, res) {
    try {
        if (req.isAuthenticated()) {
            const username = _.toLower(req.params.username);
            const user = req.user;
    
            if(!checkMatch(user, username)){
                res.redirect("/");
            } else {
    
                let foundUser = await User.model.findOne({username: username}).exec(); 

                console.log("-- Deleting User --");
                console.log(foundUser);
                    
                deleteProfileImage(foundUser);

                let reviews = await Review.model.find({author: foundUser._id}).exec();

                reviews.forEach((review) => {
                    Game.removeFromAverages(review);
                    Discussion.model.deleteOne({review: review._id}).exec();
                    Reaction.model.deleteOne({review: review._id}).exec();
                    review.remove();
                });

                await Draft.model.deleteMany({author: foundUser._id}).exec();

                await Discussion.model.updateMany({}, {"$pull": {"comments": {"user": foundUser._id}}}).exec();
               
                await User.model.deleteOne({username: username}).exec();

                res.redirect("/");
            }
    
        } else {
            res.redirect("/login");
        }
    } catch(err) {
        console.log(err);
    }
});

module.exports = router;