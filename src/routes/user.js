const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Review = require("../models/review");
const _ = require("lodash");

//show user's profile page
router.get("/:username", async function (req, res) {

    try {
        const username = _.toLower(req.params.username);

        const userProfile = await User.findOne({username: username})
        .exec();

        if(!userProfile){
            res.redirect("/");
        } else {
            let user = null;

            if(req.isAuthenticated()){
                user = req.user;
            }

            const reviews = await Review.getSetNumberOfReviews({author: userProfile._id});

            res.render("user", {user: user, userProfile: userProfile, reviews: reviews});
        }
    } catch(err) {
        console.log(err);
    }
});

router.get("/:username/:index", async function (req, res) {

    try {
        const index = Number(req.params.index);
        const username = _.toLower(req.params.username);

        const userProfile = await User.findOne({username: username})
        .exec();

        if(!userProfile){
            return res.sendStatus(404);
        }

        const reviews = await Review.getSetNumberOfReviews({author: userProfile._id}, index * 10);

        res.status(200).send(reviews);
    } catch(err) {
        console.log(err);
    }
    
});

module.exports = router;