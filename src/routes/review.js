const express = require("express");
const router = express.Router();
const _ = require("lodash")
const Review = require("../models/review");
const Draft = require("../models/draft");
const User = require("../models/user");
const Reaction = require("../models/reaction");
const Discussion = require("../models/discussion");
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
            user: user,
            igdbId: "",
            gameName: ""
        }

        if (req.session["createMessage"] !== null) {
            data["createMessage"] = req.session["createMessage"];
            req.session["createMessage"] = null;
        }

        res.render("create", data);

    } else {
        res.redirect("/login");
    }
});

//review creation page
router.get("/create/:gameLink", async function (req, res) {
    if (req.isAuthenticated()) {

        const gameLink = req.params.gameLink;

        const game = await Game.model.findOne({linkName: gameLink}).exec();

        if(!game){
            return res.redirect("/reviews/create");
        }

        const user = req.user;
        const data = {
            user: user,
            igdbId: game.igdbId,
            gameName: game.displayName
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

            let user = await User.model.findOne({ _id: req.user.id }).exec();
            const igdbId = Number(req.body.igdbId);
            let game = await Game.model.findOne({igdbId: igdbId}).exec();

            if(!game){
                let gameData = await igdb.findGameByIgdbId(igdbId);
                game = await Game.createGameEntry(gameData);
            }

            //find if user has already created a review for this game
            let existingReview = await Review.model.findOne({ author: user._id, gameId: game._id }).exec();

            if(existingReview){
                req.session.createMessage = "You have already created a review for this game. Please edit or delete your existing review if you wish to rewrite it.";
                return res.redirect("/reviews/create");
            }


            //create new reaction
            const newReaction = new Reaction();
            let reactions = await newReaction.save();

            const createDiscussion = req.body.discussion;
            let newDiscussion = null;

            if(createDiscussion){
                newDiscussion = new Discussion.model();
                await newDiscussion.save();
            }

            const review = await Review.createReview(req, user, game, reactions, newDiscussion);
            const reviewId = review._id;

            await Game.addToAverages(review);

            //link review to reaction
            reactions.review = reviewId;
            reactions.save();

            if(newDiscussion !== null){
                //link review to discussion
                newDiscussion.review = reviewId;
                newDiscussion.save();
            }


            //link review to user
            user.userReviews.unshift(reviewId);
            user.save();
    
            //remove draft from user and drafts collection
            if(req.body.draftId !== null){
                let draftDelete = Draft.model.deleteOne({_id: req.body.draftId}).exec();

                //remove draft ID from the user's review collection
                let userUpdate = User.model.updateOne({ _id: req.user._id }, { $pull: { userDrafts: { $in: req.body.draftId } } }).exec();

                await draftDelete;
                await userUpdate;
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

            const data = { 
                user: user, 
                review: review 
            };

            let comments = await Discussion.getComments(reviewId);
            console.log(comments);

            if(comments){
                data.comments = comments;
            }

            res.render("review", data);
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

//delete review, related reaction, remove from user's created reviews
router.post("/:reviewId/delete", async function (req, res) {

    try {
        if (req.isAuthenticated()) {
            const reviewId = req.params.reviewId;

            //removes review and all review related data from other collections

            let review = null

            if(User.isAdmin(req.user)){
                review = await Review.model.findOne({ _id: reviewId}).exec();
            } else {
                review = await Review.model.findOne({ _id: reviewId, author: req.user._id }).exec();
            }


            await Game.removeFromAverages(review);

            let reviewDelete = null

            if(User.isAdmin(req.user)){
                reviewDelete = Review.model.deleteOne({ _id: reviewId }).exec();
            } else {
                reviewDelete = Review.model.deleteOne({ _id: reviewId, author: req.user._id }).exec();
            }


            let discussionDelete = Discussion.model.deleteOne({ review: reviewId }).exec();

            let reactionDelete = Reaction.deleteOne({ review: reviewId }).exec();

            let userUpdate = User.model.updateOne({ _id: review.author }, { $pull: { userReviews: { $in: reviewId } } }).exec();

            await reviewDelete;
            await reactionDelete;
            await userUpdate;
            await discussionDelete;
            
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

router.post("/:reviewId/comments/add", async function (req, res) {

    try {
        if (req.isAuthenticated()) {
            const reviewId = req.params.reviewId;
            const comment = req.body.comment;

            const discussion = await Discussion.addToDiscusssion(reviewId, req.user.id, comment);

            console.log(discussion);


            res.status(200).send(discussion);
        } else {
            res.redirect("/login");
        }
    } catch(err) {
        console.log(err);
    }

});


router.post("/:reviewId/comments/:comment_id/remove", async function (req, res) {

    try {
        if (req.isAuthenticated()) {
            const reviewId = req.params.reviewId;
            const commentId = req.params.comment_id;

            let result = null;

            if(User.isAdmin(req.user)){
                result = await Discussion.model.updateOne({review: reviewId}, {"$pull": {"comments": {"_id": commentId}}}).exec();
            } else {
                result = await Discussion.model.updateOne({review: reviewId}, {"$pull": {"comments": {"_id": commentId, "user": req.user._id}}}).exec();
            }

            console.log(result);

            res.status(200).send(result);
        } else {
            res.redirect("/login");
        }
    } catch(err) {
        console.log(err);
    }

});

router.post("/:reviewId/comments/:comment_id/edit", async function (req, res) {

    try {
        if (req.isAuthenticated()) {
            const reviewId = req.params.reviewId;
            const commentId = req.params.comment_id;
            const newComment = req.body.comment;

            const doc = await Discussion.model.findOne({review: reviewId}).exec();
            let comment = doc.comments.id(commentId);

            if(!User.isAdmin(req.user) && String(comment.user) !== String(req.user._id)){
                return res.status(404).send({reason: "You are trying to edit a comment that isn't yours!"})
            }

            comment.comment = newComment;
            await doc.save();

            res.status(200).send(comment);
        } else {
            res.redirect("/login");
        }
    } catch(err) {
        console.log(err);
    }

});



module.exports = router;