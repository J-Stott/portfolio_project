const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Review = require("../models/review");
const Latest = require("../models/latest");
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

                    if (req.session.userMessage !== null) {
                        data.userMessage = req.session.userMessage;
                        req.session.userMessage = null;
                    }
            
                    if (req.session.imageMessage !== null) {
                        data.imageMessage = req.session.imageMessage;
                        req.session.imageMessage = null;
                    }
            
                    if (req.session.passwordMessage !== null) {
                        data.passwordMessage = req.session.passwordMessage;
                        req.session.passwordMessage = null;
                    }
            
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
    
                    foundUser.profileImg = "/profileImages/" + file.filename;
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
                const lowerCaseUser = _.toLower(foundUser.displayName);
                const lowerFormName = _.toLower(displayName);
    
                if (lowerCaseUser !== lowerFormName) {
                    req.session.userMessage = "Entered name does not match your username";
                    res.redirect(`/profile/${username}`);
                } else {
                    foundUser.displayName = displayName;
                    foundUser.bio = bio;
                    await foundUser.save();
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
                    
                if (foundUser.profileImg !== settings.DEFAULT_PROFILE_IMG) {
                    const fileName = path.join(__dirname, "public", user.profileImg);

                    fs.unlink(fileName, (err) => {
                        if (err) {
                            console.error(err);
                        }
                    });
                }
    
                //find in the latests if it exists and remove
                await Latest.deleteMany({ review: {$in: foundUser.userReviews} }).exec();

                await Review.review.deleteMany({_id: {$in: foundUser.userReviews}}).exec();

                await Review.draft.deleteMany({_id: {$in: foundUser.userDrafts}}).exec();
               
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