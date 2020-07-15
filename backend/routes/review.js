const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Review = require("../models/review");
const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const settings = require("../../settings");


router.get("/", function (req, res) {
    if (req.isAuthenticated()) {
        const user = req.user;
        const data = {
            user: user
        }

        res.render("review", data);

    } else {
        res.redirect("/login");
    }
});

router.post("/", function (req, res) {
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

module.exports = router;