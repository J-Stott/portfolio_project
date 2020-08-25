const express = require("express");
const router = express.Router();
const Draft = require("../models/draft");
const User = require("../models/user");
const Game = require("../models/game");
const settings = require("../../settings");

//get a users saved drafts
router.get("/:username", async function (req, res) {

    try {
        if(req.isAuthenticated()){
            
            let drafts = await Draft.getSetNumberOfDrafts({author:  req.user._id});
            
            if(!drafts) {
                return res.redirect("/")
            }

            res.render("drafts", {user: req.user, drafts: drafts});
        } else {
            res.redirect("/login");
        }
    } catch(err) {
        console.log(err);
    } 
});

//create a new draft and save it off
router.post("/create", async function (req, res) {

    try{
        if (req.isAuthenticated()) {

            let user = await User.model.findOne({ _id: req.user.id }).exec();

            const igdbId = Number(req.body.igdbId);
            let game = await Game.findOrCreateGameEntry(igdbId);
            const draft = await Draft.createDraft(user, game, req);
            const draftId = draft._id;
            res.redirect("/");
    
        } else {
            res.redirect("/login");
        }
    } catch(err){
        console.log(err);
    }

});

//get draft data and send it to edit template
router.get("/:draftId/edit", async function (req, res) {

    try{
        if (req.isAuthenticated()) {
            const draftId = req.params.draftId;
    
            let draft = await Draft.model.findOne({ _id: draftId, author: req.user._id })
            .populate({
                path: "gameId",
                model: "Game",
                select: {"displayName": 1, "igdbId": 1, "_id": 0}
            })
            .exec();

            console.log(draft);

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

//save an edited draft
router.post("/:draftId/edit", async function (req, res) {

    try{
        if (req.isAuthenticated()) {
            const draftId = req.params.draftId;

            const igdbId = Number(req.body.igdbId);
            let game = await Game.findOrCreateGameEntry(igdbId);
    
            await Draft.updateDraft(draftId, game, req);

            res.redirect(`/drafts/${req.user.displayName}`);
        } else {
            res.redirect("/login");
        }
    } catch(err) {
        console.log(err);
    }

});

//delete a particular draft
router.post("/:draftId/delete", async function (req, res) {

    try {
        if (req.isAuthenticated()) {
            const draftId = req.params.draftId;

            //remove only if the author ids match
            let draftDelete = Draft.model.deleteOne({ _id: draftId, author: req.user._id }).exec();
            await draftDelete;
            res.redirect(`/drafts/${req.user.displayName}`);

        } else {
            res.redirect("/login");
        }
    } catch(err) {
        console.log(err);
    }

});

router.get("/:username/:index", async function (req, res) {

    try {
        if(req.isAuthenticated()){
            const index = Number(req.params.index);
            
            const userProfile = await User.model.findOne({_id: req.user._id})
            .exec();
    
            if(!userProfile){
                return res.sendStatus(404);
            }
    
            const drafts = await Draft.getSetNumberOfDrafts({author: userProfile._id}, index * settings.NUM_REVIEWS_TO_GET);
    
            res.status(200).send(drafts);
        }

    } catch(err) {
        console.log(err);
    }
    
});

module.exports = router;