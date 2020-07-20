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

router.post("/create", async function (req, res) {

    try {
        if (req.isAuthenticated()) {

            let user = await User.findOne({ _id: req.user.id }).exec();

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
    
    
            let review = await newReview.save();
            const reviewId = review._id;

            user.userReviews.push(reviewId);
            user.save();
    
            //remove draft from user and drafts collection
            if(req.body.draftId !== null){
                let draftDelete = Review.draft.deleteOne({_id: req.body.draftId}).exec();

                //remove draft ID from the user's review collection
                let userUpdate = User.updateOne({ _id: req.user._id }, { $pull: { userDrafts: { $in: req.body.draftId } } }).exec();

                await draftDelete;
                await userUpdate;
            }
            let latest = new Latest({review: reviewId});
            await latest.save();
            let latests = await Latest.find({}).exec();
            if(latests.length >= settings.LATESTS_MAX_LENGTH){
                //remove any old latest posts
                for(let i = 0; i < latests.length - settings.LATESTS_MAX_LENGTH; i++){
                    await latests[i].remove();
                }
            }

            res.redirect("/");
    
        } else {
            res.redirect("/login");
        }
    } catch(err) {
        console.log(err);
    }
});

router.get("/:reviewId", async function (req, res) {
    try{
        const reviewId = req.params.reviewId;
        let review = await Review.review.findOne({ _id: reviewId })
        .populate({ path: "author" })
        .exec();

        if (!review) {
            res.redirect("/");
        } else {
            let user = null;
            if (req.isAuthenticated()) {
                user = req.user;
            }
            res.render("review", { user: user, review: review });
        }
    } catch(err) {
        console.log(err);
    }
});

router.get("/:reviewId/edit", async function (req, res) {

    try {
        if (req.isAuthenticated()) {
            const reviewId = req.params.reviewId;
    
            let review = await Review.review.findOne({ _id: reviewId, author: req.user._id }).exec(); 
            if (!review) {
                res.redirect("/");
            } else {
                res.render("edit", { user: req.user, reviewData: review });
            }
        } else {
            res.redirect("/login");
        }
    } catch(err) {
        console.log(err);
    }

});

router.post("/:reviewId/edit", async function (req, res) {

    try {
        if (req.isAuthenticated()) {
            const reviewId = req.params.reviewId;
    
            await Review.review.updateOne({ _id: reviewId, author: req.user._id }, {
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
            }).exec();

            res.redirect("/");
        } else {
            res.redirect("/login");
        }
    } catch(err) {
        console.log(err);
    }

});

router.post("/:reviewId/delete", async function (req, res) {

    try {
        if (req.isAuthenticated()) {
            const reviewId = req.params.reviewId;
    
            //remove only if the author ids match
            let reviewDelete = Review.review.deleteOne({ _id: reviewId, author: req.user._id }).exec();

            let latestDelete = Latest.deleteOne({ review: reviewId }).exec();

            let userUpdate = User.updateOne({ _id: req.user._id }, { $pull: { userReviews: { $in: reviewId } } }).exec();

            await reviewDelete;
            await latestDelete;
            await userUpdate;
            
            res.redirect("/");
        } else {
            res.redirect("/login");
        }
    } catch(err) {
        console.log(err);
    }

});

module.exports = router;