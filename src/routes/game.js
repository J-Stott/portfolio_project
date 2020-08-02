const express = require("express");
const router = express.Router();
const _ = require("lodash");
const igdb = require("../components/igdb_functions");
const Game = require("../models/game");
const Review = require("../models/review");


async function renderGame(game, req, res){
    let data = {
        gameData: game,
        user: null
    }

    if (req.isAuthenticated()) {
        data.user = req.user;
    }

    const reviews = await Review.model.find({gameId: game._id})
    .populate({path: "gameId", select: "displayName image -_id"})
    .populate({path: "author", select: "displayName profileImg -_id"})
    .sort({created: "desc"})
    .exec();

    if(reviews.length > 0){
        data.reviews = reviews;
    }

    res.render("game", data);
}

//get a users saved drafts
router.get("/:gameName", async function (req, res) {

    try {
        const gameName = req.params.gameName;
        let game = await Game.model.findOne({linkName: gameName}).exec();

        //if it doesn't exist in the db, search igdb api. 
        if(!game){
            res.redirect("/");
        } else {
            renderGame(game, req, res);
        }
        
    } catch(err) {
        console.log(err);
    } 
});

//ajax request used for search bar(s)
router.post("/search/:term", async function (req, res) {

    try {
        
        const term = req.params.term;
        const searchTerm = _.lowerCase(term);

        //const gameData = await igdb.searchForGames(searchTerm);
        const gameData = await igdb.collateDbAndIgdbGames(Game, searchTerm);

        if("status" in gameData){
            return res.status(gameData.status).send(gameData.statusText);
        }
        
        res.status(200).send(gameData);
        
    } catch(err) {
        console.log(err);
    } 
});


module.exports = router;