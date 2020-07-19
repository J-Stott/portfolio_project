const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Review = require("../models/review");
const Latest = require("../models/latest");
const User = require("../models/user");
const settings = require("../../settings");


router.get("/create", function (req, res) {
    if (req.isAuthenticated()) {
        const user = req.user;
        const data = {
            user: user
        }

        res.render("create", data);

    } else {
        res.redirect("/login");
    }
});

router.post("/create", function (req, res) {
    if (req.isAuthenticated()) {

        User.findOne({ _id: req.user.id }, function (err, user) {
            const newReview = new Review.review({
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


            newReview.save(function (err, review) {
                if (err) {
                    console.log(err);
                } else {
                    //if successful, add the id to the latest reviews collection
                    const reviewId = review._id;

                    console.log("Review - ", review);

                    user.userReviews.push(reviewId);
                    user.save();

                    //remove draft from user and drafts collection
                    if(req.body.draftId !== null){
                        Review.draft.deleteOne({_id: req.body.draftId}, function(err){
                            if(err){
                                console.log(err);
                            } else {
                                console.log("draft removed");
                            }
                        });

                        //remove draft ID from the user's review collection
                        User.updateOne({ _id: req.user._id }, { $pull: { userDrafts: { $in: req.body.draftId } } }).exec(function (err) {
                            if (err) {
                                console.log(err)
                            }
                        });
                    }

                    Latest.find({}, function (err, latests) {

                        if(latests.length >= settings.LATESTS_MAX_LENGTH){
                            //remove any old latest posts
                            for(let i = 0; i < (latests.length + 1) - settings.LATESTS_MAX_LENGTH; i++){
                                latests[i].remove(function(err){
                                });
                            }
                        }
                        
                        let latest = new Latest({review: reviewId});
                        latest.save(function(err){
                            if(!err){
                                res.redirect("/");
                            }
                        });
                    });
                }
            });
        });

    } else {
        res.redirect("/login");
    }
});

router.get("/:reviewId", function (req, res) {

    const reviewId = req.params.reviewId;

    Review.review.findOne({ _id: reviewId })
        .populate({ path: "author" })
        .exec(function (err, review) {
            if (err) {
                console.log(err);
            } else if (!review) {
                res.redirect("/");
            } else {

                let user = null;

                if (req.isAuthenticated()) {
                    user = req.user;
                }

                res.render("review", { user: user, review: review });
            }
        });
});

router.get("/:reviewId/edit", function (req, res) {

    if (req.isAuthenticated()) {
        const reviewId = req.params.reviewId;

        Review.review.findOne({ _id: reviewId, author: req.user._id }, function (err, review) {
            if (err) {
                console.log(err);
                res.redirect("/");
            } else if (!review) {
                res.redirect("/");
            } else {
                res.render("edit", { user: req.user, reviewData: review });
            }
        });
    } else {
        res.redirect("/login");
    }
});

router.post("/:reviewId/edit", function (req, res) {

    if (req.isAuthenticated()) {
        const reviewId = req.params.reviewId;

        Review.review.updateOne({ _id: reviewId, author: req.user._id }, {
            gameData: {
                gameTitle: req.body.game,
            }, 
            title: req.body.title, 
            content: req.body.content, 
            ratings: {
                //if user hasn't entered a rating, presume 0
                gameplay: "gameplay" in req.body ? Number(req.body.gameplay) : 0,
                visuals: "visuals" in req.body ? Number(req.body.visuals) : 0,
                audio: "audio" in req.body ? Number(req.body.audio) : 0,
                story: "story" in req.body ? Number(req.body.story) : 0,
                overall: "overall" in req.body ? Number(req.body.overall) : 0,
            },
        }, function (err) {
            if (err) {
                console.log(err);
            } else {
                res.redirect("/");
            }
        });
    } else {
        res.redirect("/login");
    }
});

router.post("/:reviewId/delete", function (req, res) {

    if (req.isAuthenticated()) {
        const reviewId = req.params.reviewId;

        //remove only if the author ids match
        Review.review.deleteOne({ _id: reviewId, author: req.user._id },
            function (err) {
                if (err) {
                    console.log(err);
                } else {

                    //find in the latests if it exists and remove
                    Latest.deleteOne({ review: reviewId }, function (err) {
                        if (err) {
                            console.log(err);
                        }
                    });

                    //remove review ID from the user's review collection
                    User.updateOne({ _id: req.user._id }, { $pull: { userReviews: { $in: reviewId } } }).exec(function (err) {
                        if (err) {
                            console.log(err)
                        } else {
                            res.redirect("/");
                        }
                    });
                }
            });
    } else {
        res.redirect("/login");
    }
});

module.exports = router;