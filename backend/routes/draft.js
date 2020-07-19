const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Review = require("../models/review");
const User = require("../models/user");
const settings = require("../../settings");
const _ = require("lodash");

router.get("/:username", function (req, res) {

    if(req.isAuthenticated()){
         
        User.findOne({_id: req.user._id})
            .populate({path: "userDrafts"})
            .exec(function(err, profile){
                if(err){
                    console.log(err);
                } else if(!profile) {
                    res.redirect("/");
                } else {

                    let user = null;

                    console.log(profile);

                    if(req.isAuthenticated()){
                        user = req.user;
                    }

                    res.render("drafts", {user: user, drafts: profile. userDrafts});
                }
        });
    } else {
        res.redirect("/login");
    }
    
});

router.post("/create", function (req, res) {
    if (req.isAuthenticated()) {

        User.findOne({ _id: req.user.id }, function (err, user) {
            const newDraft = new Review.draft({
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


            newDraft.save(function (err, draft) {
                if (err) {
                    console.log(err);
                } else {
                    //if successful, add the id to the latest reviews collection
                    const draftId = draft._id;

                    console.log("Draft - ", draft);

                    user.userDrafts.push(draftId);
                    user.save(function(err){
                        if(!err){
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

router.get("/:draftId/edit", function (req, res) {

    if (req.isAuthenticated()) {
        const draftId = req.params.draftId;

        Review.draft.findOne({ _id: draftId, author: req.user._id }, function (err, draft) {
            if (err) {
                console.log(err);
                res.redirect("/");
            } else if (!draft) {
                res.redirect("/");
            } else {
                res.render("draftEdit", { user: req.user, reviewData: draft, draftId: draft._id });
            }
        });
    } else {
        res.redirect("/login");
    }
});

router.post("/:draftId/edit", function (req, res) {

    if (req.isAuthenticated()) {
        const draftId = req.params.draftId;

        Review.draft.updateOne({ _id: draftId, author: req.user._id }, {
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
                res.redirect(`/drafts/${req.user.displayName}`);
            }
        });
    } else {
        res.redirect("/login");
    }
});

router.post("/:draftId/delete", function (req, res) {

    if (req.isAuthenticated()) {
        const draftId = req.params.reviewId;

        //remove only if the author ids match
        Review.draft.deleteOne({ _id: draftId, author: req.user._id },
            function (err) {
                if (err) {
                    console.log(err);
                } else {

                    //remove draft ID from the user's review collection
                    User.updateOne({ _id: req.user._id }, { $pull: { userDrafts: { $in: draftId } } }).exec(function (err) {
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