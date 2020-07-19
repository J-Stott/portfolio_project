const express = require("express");
const User = require("../models/user");
const router = express.Router();
const _ = require("lodash");

router.get("/:username", function (req, res) {
    const username = _.lowerCase(req.params.username);
    console.log(username);

    User.findOne({username: username})
        .populate({path: "userReviews"})
        .exec(function(err, profile){
            if(err){
                console.log(err);
            } else if(!profile) {
                res.redirect("/");
            } else {

                let user = null;

                if(req.isAuthenticated()){
                    user = req.user;
                }

                console.log(profile);

                res.render("user", {user: user, profileData: profile});
            }
    });
});

module.exports = router;