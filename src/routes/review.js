const express = require("express");
const router = express.Router();
const _ = require("lodash")
const Review = require("../models/review");
const Draft = require("../models/draft");
const Latest = require("../models/latest");
const User = require("../models/user");
const Reaction = require("../models/reaction");
const igdb = require("../components/igdb_functions");
const Game = require("../models/game");
const settings = require("../../settings");

function getUserReaction(reaction, user){

    let userReaction = reaction.userReactions.find((data) =>{
        return String(data.user) === String(user._id);
    });

    if(userReaction === undefined){
        return null;
    }

    return userReaction;
}

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

            //create new reaction
            const newReaction = new Reaction();
            let reactions = await newReaction.save();


            const igdbId = Number(req.body.igdbId);
            let game = await Game.model.findOne({igdbId: igdbId}).exec();
            
            if(!game){
                let gameData = await igdb.findGameByIgdbId(igdbId);
                game = await Game.createGameEntry(gameData);
            }

            const review = await Review.createReview(user, game, reactions, req);
            const reviewId = review._id;

            await Game.addToAverages(review);

            //link review to reaction
            reactions.review = reviewId;
            reactions.save();

            //link review to user
            user.userReviews.unshift(reviewId);
            user.save();
    
            //remove draft from user and drafts collection
            if(req.body.draftId !== null){
                let draftDelete = Draft.model.deleteOne({_id: req.body.draftId}).exec();

                //remove draft ID from the user's review collection
                let userUpdate = User.updateOne({ _id: req.user._id }, { $pull: { userDrafts: { $in: req.body.draftId } } }).exec();

                await draftDelete;
                await userUpdate;
            }
            let latest = new Latest.model({review: reviewId});
            await latest.save();
            let latests = await Latest.model.find({}).exec();
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
        console.log("Are we here? If so, why?");
        const reviewId = req.params.reviewId;
        let populateOptions = {path: "reactions", select: "reaction -_id"};
        //get all reactions and the specific reaction from the logged in user, if any

        let review = await Review.model.findOne({ _id: reviewId })
        .populate({ path: "author", select: ["_id", "profileImg", "displayName"]})
        .populate({path: "reactions", select: "reaction -_id"})
        .populate({path: "gameId", select: "image displayName -_id"})
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

//edit reviews
router.get("/:reviewId/edit", async function (req, res) {

    try {
        if (req.isAuthenticated()) {
            const reviewId = req.params.reviewId;
    
            let review = await Review.model.findOne({ _id: reviewId, author: req.user._id })
            .populate({path: "gameId", select: "displayName -_id"})
            .exec(); 
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

            let review = await Review.model.findOne({ _id: reviewId, author: req.user._id }).exec();

            await Game.removeFromAverages(review);

            review = await Review.updateReview(review, req);
            console.log(review);

            await Game.addToAverages(review);
    
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

            let review = await Review.model.findOne({ _id: reviewId, author: req.user._id }).exec();

            await Game.removeFromAverages(review);

            let reviewDelete = Review.model.deleteOne({ _id: reviewId, author: req.user._id }).exec();

            let reactionDelete = Reaction.deleteOne({ review: reviewId }).exec();

            let latestDelete = Latest.model.deleteOne({ review: reviewId }).exec();

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

router.get("/:reviewId/userRatings", async function (req, res) {

    try {

        const response = {
            userReactions: null
        }

        if (req.isAuthenticated()) {
            const reviewId = req.params.reviewId;
            const reactionName = req.params.reactionName;
    
            let reaction = await Reaction.findOne({review: reviewId},"userReactions")
            .exec();
    
            //check that a reaction exists for the logged in user
            let userReaction = getUserReaction(reaction, req.user);
            
            if(userReaction !== null){
                response.userReactions = userReaction.userReaction
            }

            res.status(200).send(response);
    
        } else {
            res.status(200).send(response);
        }
    } catch(err) {
        console.log(err);
    }

});

router.post("/:reviewId/:reactionName", async function (req, res) {

    try {
        if (req.isAuthenticated()) {
            const reviewId = req.params.reviewId;
            const reactionName = req.params.reactionName;

            let reaction = await Reaction.findOne({review: reviewId},"reaction userReactions")
            .exec();

            //check that a reaction exists for the logged in user
            let userReaction = getUserReaction(reaction, req.user);
            
            if(userReaction === null){
                //create users reaction, bump appropriate reaction and save
                userReaction = { 
                    user: req.user._id,
                    userReaction: {
                        informative: 0,
                        funny: 0,
                        troll: 0,
                    }
                };

                userReaction.userReaction[reactionName] = 1;
                reaction.userReactions.unshift(userReaction);
                reaction.reaction[reactionName]++;
                await reaction.save();
            } else {

                if(userReaction.userReaction[reactionName] == 0){
                    reaction.reaction[reactionName]++;
                    userReaction.userReaction[reactionName] = 1;
                    await reaction.save();
                } else {
                    reaction.reaction[reactionName]--;
                    userReaction.userReaction[reactionName] = 0;
                    await reaction.save();
                }
            }
            
            const response = {
                [reactionName]: reaction.reaction[reactionName],
                userReactions: userReaction.userReaction,
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