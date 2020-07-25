const express = require("express");
const router = express.Router();
const Review = require("../models/review");
const Draft = require("../models/draft");
const Latest = require("../models/latest");
const User = require("../models/user");
const Reaction = require("../models/reaction");
const settings = require("../../settings");

//review creation page
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

//create new review, new reaction set for that review, push review id to user account
router.post("/create", async function (req, res) {

    try {
        if (req.isAuthenticated()) {

            let user = await User.findOne({ _id: req.user.id }).exec();

            const newReaction = new Reaction();
            let reactions = await newReaction.save();

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
                reactions: reactions._id,
            });

            let review = await newReview.save();
            const reviewId = review._id;

            reactions.review = reviewId;
            reactions.save();

            user.userReviews.push(reviewId);
            user.save();
    
            //remove draft from user and drafts collection
            if(req.body.draftId !== null){
                let draftDelete = Draft.deleteOne({_id: req.body.draftId}).exec();

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

//show review
router.get("/:reviewId", async function (req, res) {
    try{
        const reviewId = req.params.reviewId;
        let populateOptions = {path: "reactions", select: "reaction -_id"};
        //get all reactions and the specific reaction from the logged in user, if any

        if(req.isAuthenticated()){
            populateOptions.populate = {
                path: "userReactions", 
                select: "userReaction", 
                match: { 
                    user: req.user._id 
                }
            };
        }

        let review = await Review.findOne({ _id: reviewId })
        .populate({ path: "author", select: ["_id", "profileImg", "displayName"]})
        .populate(populateOptions)
        .exec();
        
        console.log(review);

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

//edit reviews
router.get("/:reviewId/edit", async function (req, res) {

    try {
        if (req.isAuthenticated()) {
            const reviewId = req.params.reviewId;
    
            let review = await Review.findOne({ _id: reviewId, author: req.user._id }).exec(); 
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

//update review
router.post("/:reviewId/edit", async function (req, res) {

    try {
        if (req.isAuthenticated()) {
            const reviewId = req.params.reviewId;
    
            await Review.updateOne({ _id: reviewId, author: req.user._id }, {
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

//delete review, related reaction, remove from latests and user's created reviews
router.post("/:reviewId/delete", async function (req, res) {

    try {
        if (req.isAuthenticated()) {
            const reviewId = req.params.reviewId;

            //removes review and all review related data from other collections
            let reviewDelete = Review.deleteOne({ _id: reviewId, author: req.user._id }).exec();

            let reactionDelete = Reaction.deleteOne({ review: reviewId}).exec();

            let latestDelete = Latest.deleteOne({ review: reviewId }).exec();

            let userUpdate = User.updateOne({ _id: req.user._id }, { $pull: { userReviews: { $in: reviewId } } }).exec();

            await reviewDelete;
            await reactionDelete;
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

//delete review, related reaction, remove from latests and user's created reviews
router.post("/:reviewId/:reactionName", async function (req, res) {

    try {
        if (req.isAuthenticated()) {
            const reviewId = req.params.reviewId;
            const reactionName = req.params.reactionName;
            
            const response = {
                id: reviewId,
                reaction: reactionName,
            }

            res.status(200).send(response);
        } else {
            res.redirect("/login");
        }
    } catch(err) {
        console.log(err);
    }

});

module.exports = router;