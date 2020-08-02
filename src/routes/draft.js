const express = require("express");
const router = express.Router();
const Draft = require("../models/draft");
const User = require("../models/user");
const Game = require("../models/game");
const igdb = require("../components/igdb_functions");

//get a users saved drafts
router.get("/:username", async function (req, res) {

    try {
        if(req.isAuthenticated()){
         
            let profile = await User.findOne({_id: req.user._id})
                .populate({
                    path: "userDrafts",
                    populate: {
                        path: "gameId",
                        model: "Game",
                        select: {"displayName": 1, "image": 1, "_id": 0}
                    }
                })
                .exec();
            
            console.log("-- drafts: user profile --");
            console.log(profile);
            
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

//create a new draft and save it off
router.post("/create", async function (req, res) {

    try{
        if (req.isAuthenticated()) {

            let user = await User.findOne({ _id: req.user.id }).exec();

            const igdbId = Number(req.body.igdbId);
            let game = await Game.model.findOne({igdbId: igdbId}).exec();
            
            if(!game){
                let gameData = await igdb.findGameByIgdbId(igdbId);
                game = await Game.createGameEntry(gameData);
                console.log("-- game created --");
                console.log(game);
            }
    
            const draft = await Draft.createDraft(user, game, req);

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
            console.log("-- draft edit: igdbId--");
            console.log(igdbId);
            let game = await Game.model.findOne({igdbId: igdbId}).exec();
            console.log("-- draft edit: found game --");
            console.log(game);
            
            if(!game){
                let gameData = await igdb.findGameByIgdbId(igdbId);
                game = await Game.createGameEntry(gameData);
                console.log("-- game created --");
                console.log(game);
            }
    
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