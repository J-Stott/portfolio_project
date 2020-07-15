const express = require("express");
const router = express.Router();
const User = require("../models/user");
const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const settings = require("../../settings");
let upload = require("../components/profile_uploader");


router.get("/", function (req, res) {
    if (req.isAuthenticated()) {
        const user = req.user;
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

        res.render("profile", data);

    } else {
        res.redirect("/login");
    }
});

router.post("/updateImage", upload.single("profile"), function (req, res) {
    if (req.isAuthenticated()) {
        //check if we have been given an appropriate file
        if (!req.file) {
            req.session.imageMessage = "Please provide a valid file. (.jpeg/.png)";
            res.redirect("/profile");
        } else {
            //update user profile path
            const user = req.user;
            const file = req.file;
            User.findById(user._id, function (err, foundUser) {

                foundUser.profileImg = "/profileImages/" + file.filename;
                foundUser.save(function (err) {
                    if (err) {
                        console.log(err)
                    } else {
                        res.redirect("/profile");
                    }
                })
            });
        }

    } else {
        res.redirect("/login");
    }
});

router.post("/updateName", function (req, res) {
    if (req.isAuthenticated()) {
        const user = req.user;
        const displayName = req.body.displayName;

        //double check they have given us an appropriate name
        const lowerCaseUser = _.toLower(user.displayName);
        const lowerFormName = _.toLower(displayName);

        console.log(lowerCaseUser, "-", lowerFormName);

        if (lowerCaseUser !== lowerFormName) {
            req.session.userMessage = "Entered name does not match your username";
            res.redirect("/profile");
        } else {
            //update display name if successful
            User.findById(user._id, function (err, foundUser) {

                foundUser.displayName = displayName;

                foundUser.save(function (err) {
                    if (err) {
                        console.log(err)
                    } else {
                        res.redirect("/profile");
                    }
                })
            });
        }


    } else {
        res.redirect("/login");
    }
});

//clear out all user data
router.post("/delete", function (req, res) {
    if (req.isAuthenticated()) {
        const user = req.user;

        //remove profile image
        if (user.profileImg !== settings.DEFAULT_PROFILE_IMG) {
            const fileName = path.join(__dirname, "public", user.profileImg);

            fs.unlink(fileName, (err) => {
                if (err) {
                    console.error(err);
                }
            });
        }


        User.deleteOne({ _id: user._id }, function (err) {

            if (err) {
                console.log(err)
            } else {
                res.redirect("/");
            }
        });

    } else {
        res.redirect("/login");
    }
});

module.exports = router;