const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Review = require("../models/review");
const Latest = require("../models/latest");
const User = require("../models/user");


router.get("/create", function (req, res) {
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

router.post("/create", function (req, res) {
    if (req.isAuthenticated()) {

        User.findOne({_id: req.user.id}, function(err, user){
            const newReview = new Review({
                author: user._id,
                gameData: { 
                    gameTitle: req.body.game,
                },
                ratings: {
                    //if user hasn't entered a rating, presume 0
                    gameplay: "gameplay" in req.body ? Number(req.body.gameplay) : 0,
                    visuals: "visuals" in req.body ? Number(req.body.visuals) : 0,
                    audio: "audio" in req.body ? Number(req.body.audio) : 0,
                    story: "story" in req.body ? Number(req.body.story) : 0,
                    overall: "overall" in req.body ? Number(req.body.overall) : 0,
                },
                title: req.body.title,
                content: req.body.content,
            });

            
            newReview.save(function(err, review){
                if(err){
                    console.log(err);
                } else {
                    //if successful, add the id to the latest reviews collection
                    const reviewId = review._id;

                    console.log("Review - ", review);

                    user.userReviews.push(reviewId);
                    user.save();
                  
                    Latest.create({review: reviewId}, function(err){
                        if(err) {
                            console.log(err);
                        } else {
                            res.redirect("/");
                        }
                    });
                }
            });
        });

    } else {
        res.redirect("/login");
    }
});

module.exports = router;