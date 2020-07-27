const express = require("express");
const router = express.Router();
const axios = require("axios");
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

    const reviews = await Review.find({gameId: game._id}).exec();

    if(!reviews.length === 0){
        data.reviews = reviews;
    }

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

            const searchTerm = _.lowerCase(gameName);
            console.log(searchTerm);

            const response = await igdb.searchForGames(searchTerm);
            const responseData = response.data;
            console.log(responseData);
            
            if(responseData.length === 0){
                //redirect somewhere as this game doesn't exist
                res.redirect("/");
            } else {

                const foundGames = await igdb.findGamesNotInDb(searchTerm, responseData);

                const names = foundGames.map((data) => {
                    return _.lowerCase(data.name);
                });

                const similarity = stringSimilarity.findBestMatch(searchTerm, names);

                console.log(similarity);

                const index = similarity.bestMatchIndex;

                let responseGame = foundGames[index];
                console.log(responseGame);

                game = await Game.createGameEntry(responseGame);
                res.redirect(`/games/${game.linkName}`);
            }
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
router.get("/search/:term", async function (req, res) {

    try {
        
        const term = req.params.term;
        const searchTerm = _.lowerCase(term);

        const gameData = await igdb.collateDbAndIgdbGames(searchTerm);

        console.log(gameData);
        //console.log(responseData);
        //res.status(200).send(responseData);
        
    } catch(err) {
        console.log(err);
    } 
});


module.exports = router;