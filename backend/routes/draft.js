const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Draft = require("../models/draft");
const User = require("../models/user");
const settings = require("../../settings");
const _ = require("lodash");

router.get("/:username", async function (req, res) {

    try {
        if(req.isAuthenticated()){
         
            let profile = await User.findOne({_id: req.user._id})
                .populate({path: "userDrafts"})
                .exec();
            
            if(!profile) {
                return res.redirect("/")
            }

            res.render("drafts", {user: req.user, drafts: profile.userDrafts});
        } else {
            res.redirect("/login");
        }
    } catch(err) {
        console.log(err);
    } 
});

router.post("/create", async function (req, res) {

    try{
        if (req.isAuthenticated()) {

            let user = await User.findOne({ _id: req.user.id }).exec();
    
            const newDraft = new Draft({
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
    
    
            let draft = await newDraft.save();

            const draftId = draft._id;
    
            user.userDrafts.push(draftId);
            await user.save();
            res.redirect("/");
    
        } else {
            res.redirect("/login");
        }
    } catch(err){
        console.log(err);
    }

});

router.get("/:draftId/edit", async function (req, res) {

    try{
        if (req.isAuthenticated()) {
            const draftId = req.params.draftId;
    
            let draft = await Draft.findOne({ _id: draftId, author: req.user._id }).exec();

            if(!draft){
                res.redirect("/");
            } else {
                res.render("draftEdit", { user: req.user, reviewData: draft, draftId: draft._id });
            }

        } else {
            res.redirect("/login");
        }
    } catch (err) {
        console.log(err);
    }
});

router.post("/:draftId/edit", async function (req, res) {

    try{
        if (req.isAuthenticated()) {
            const draftId = req.params.draftId;
    
            await Draft.updateOne({ _id: draftId, author: req.user._id }, {
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

            res.redirect(`/drafts/${req.user.displayName}`);
        } else {
            res.redirect("/login");
        }
    } catch(err) {
        console.log(err);
    }

});

router.get("/:draftId/delete", async function (req, res) {

    try {
        if (req.isAuthenticated()) {
            const draftId = req.params.draftId;

            //remove only if the author ids match
            let draftDelete = Draft.deleteOne({ _id: draftId, author: req.user._id }).exec();

            let userUpdate = User.updateOne({ _id: req.user._id }, { $pull: { userDrafts: { $in: draftId } } }).exec();

            await draftDelete;
            await userUpdate;

            res.redirect(`/drafts/${req.user.displayName}`);

        } else {
            res.redirect("/login");
        }
    } catch(err) {
        console.log(err);
    }

});

module.exports = router;