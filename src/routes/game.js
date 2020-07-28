const express = require("express");
const router = express.Router();
const _ = require("lodash");
const igdb = require("../components/igdb_functions");
const stringSimilarity = require("string-similarity");
const Game = require("../models/game");
const Review = require("../models/review");
const settings = require("../../settings");


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
    .exec();
    console.log("-- reviews --");
    console.log(reviews);

    if(reviews.length > 0){
        data.reviews = reviews;
    }

    console.log("-- data sent --");
    console.log(data);

    res.render("game", data);
}

//get a users saved drafts
router.get("/:gameName", async function (req, res) {

    try {
        const gameName = req.params.gameName;
        console.log(gameName);
        let game = await Game.model.findOne({linkName: gameName}).exec();

        //if it doesn't exist in the db, search igdb api. 
        if(!game){
            res.redirect("/");
        } else {
            console.log("game exists");
            console.log(game);
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

        const gameData = await igdb.collateDbAndIgdbGames(searchTerm);
        res.status(200).send(gameData);
        
    } catch(err) {
        console.log(err);
    } 
});


module.exports = router;