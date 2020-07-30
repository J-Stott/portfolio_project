const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Review = require("../models/review");
const Latest = require("../models/latest");
const Draft = require("../models/draft");
const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const settings = require("../../settings");
let upload = require("../components/profile_uploader");

function checkMatch(userData, username){
    if(userData.username === username /*|| userData.admin*/){
        return true;
    }

    return false;
}

//checks if an error message exists and adds it to data sent to rendered page
function checkAndSetErrorMessage(session, data, key){
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
    
                let foundUser = await User.findOne({username: username}).exec();

                if (!foundUser){
                    res.redirect("/");
                } else {
                    const data = {
                        user: user
                    }

                    checkAndSetErrorMessage(req.session, data, "userMessage");
                    checkAndSetErrorMessage(req.session, data, "imageMessage");
                    checkAndSetErrorMessage(req.session, data, "passwordMessage");
            
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
                    let foundUser = await User.findOne({username: username}).exec(); 
                    const profileImgName = "/profileImages/" + file.filename;

                    //delete their previous image from the server
                    if(profileImgName !==  foundUser.profileImg){
                        deleteProfileImage(foundUser);
                    }
                    
                    foundUser.profileImg = profileImgName;
                    await foundUser.save();
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
    
                let foundUser = await User.findOne({username: username}).exec(); 

                //double check they have given us an appropriate name
                const lowerFormName = _.toLower(displayName);

                console.log(foundUser.username, "-", lowerFormName);
    
                if (foundUser.username !== lowerFormName) {
                    req.session.userMessage = "Entered name does not match your username";
                    res.redirect(`/profile/${username}`);
                } else {
                    foundUser.displayName = displayName;
                    foundUser.bio = bio;
                    await foundUser.save();
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
                let foundUser = await User.findOne({username: username}).exec();

                foundUser.changePassword(req.body.oldPassword, req.body.newPassword, function(err){
                    if(err){
                        console.log(err);
                        req.session.passwordMessage = "Your old password is incorrect";
                        res.redirect(`/profile/${username}`);
                    } else {
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
    
                let foundUser = await User.findOne({username: username}).exec(); 
                    
                deleteProfileImage(foundUser);
    
                //find in the latests if it exists and remove
                await Latest.deleteMany({ review: {$in: foundUser.userReviews} }).exec();

                await Review.deleteMany({_id: {$in: foundUser.userReviews}}).exec();

                await Draft.deleteMany({_id: {$in: foundUser.userDrafts}}).exec();
               
                await User.deleteOne({username: username}).exec();

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