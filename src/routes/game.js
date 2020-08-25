const express = require("express");
const router = express.Router();
const _ = require("lodash");
const igdb = require("../components/igdb_functions");
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

    const reviews = await Review.getSetNumberOfReviews({gameId: game._id});

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

//get a users saved drafts
router.get("/:gameName/:index", async function (req, res) {

    try {
        const index = Number(req.params.index);
        const gameName = req.params.gameName;
        let game = await Game.model.findOne({linkName: gameName}).exec();

        //if it doesn't exist in the db, search igdb api. 
        if(!game){
            return res.sendStatus(404);
        }

        const reviews = await Review.getSetNumberOfReviews({gameId: game._id}, index * settings.NUM_REVIEWS_TO_GET);

        res.status(200).send(reviews);
        
    } catch(err) {
        console.log(err);
    } 
});

//create a game 
router.post("/:gameName", async function (req, res) {

    try {
        const gameName = req.params.gameName;
        const igdbId = req.body.igdbId;

        const game = await Game.findOrCreateGameEntry(igdbId);

        if(game !== null){
            return res.redirect(`/games/${gameName}`);
        }  else {
            return res.sendStatus(404);
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