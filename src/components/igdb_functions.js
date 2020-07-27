const axios = require("axios");
const Game = require("../models/game");

async function searchForGames(searchTerm, limit=20, offset=0){
    return axios({
        url: "https://api-v3.igdb.com/games",
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'user-key': process.env.IGDB_KEY,
        },
        data: `fields id,name,summary,url,cover.url,first_release_date; search "${searchTerm}"; limit ${limit}; offset ${offset}; `
      });
}

async function findGameById(id){
    return axios({
        url: "https://api-v3.igdb.com/games",
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'user-key': process.env.IGDB_KEY,
        },
        data: `fields id,name,summary,url,cover.url,first_release_date; where id = ${id};`
    });
}

async function collateDbAndIgdbGames(searchTerm){
    
    const games = await Game.model.find({$text: {$search: searchTerm}})
    .select("igdbId displayName linkName image releaseDate")
    .exec();

    let response = await searchForGames(searchTerm);

    const ids = games.map((data) => {
        return data.igdbId;
    });

    const responseData = response.data;

    const gameData = [...games];

    responseData.forEach((data) => {
        if(!ids.includes(data.id)){
            gameData.push(data);
        }
    });

    return gameData;
}

async function findGamesNotInDb(searchTerm, responseData){
    
    const games = await Game.model.find({$text: {$search: searchTerm}})
    .select("igdbId displayName linkName image releaseDate")
    .exec();


    const ids = games.map((data) => {
        return data.igdbId;
    });

    const gameData = [];

    responseData.forEach((data) => {
        if(!ids.includes(data.id)){
            gameData.push(data);
        }
    });

    return gameData;
}

module.exports = {
    searchForGames: searchForGames,
    collateDbAndIgdbGames: collateDbAndIgdbGames,
    findGamesNotInDb: findGamesNotInDb,
    findGameById: findGameById,
}