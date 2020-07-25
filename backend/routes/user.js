const express = require("express");
const router = express.Router();
const User = require("../models/user");
const _ = require("lodash");

//show user's profile page
router.get("/:username", async function (req, res) {

    try {
        const username = _.toLower(req.params.username);
        console.log(username);

        let profile = await User.findOne({username: username})
        .populate({path: "userReviews", select:["_id", "gameData", "ratings", "title", "content"]})
        .exec();

        if(!profile){
            res.redirect("/");
        } else {
            let user = null;

            if(req.isAuthenticated()){
                user = req.user;
            }

            console.log(profile);

            res.render("user", {user: user, profileData: profile});
        }
    } catch(err) {
        console.log(err);
    }
});

module.exports = router;