const axios = require("axios");
const stringSimilarity = require('string-similarity');
const settings = require("../../settings");

function getGameImageUrl(gameData){
    let imageUrl = settings.DEFAULT_GAME_IMAGE;

    if("cover" in gameData){
        imageUrl = gameData.cover.url
        imageUrl = `https:${imageUrl.replace("t_thumb", "t_cover_big")}`;
    }

    return imageUrl;
}

async function searchForGames(searchTerm, limit=10, offset=0){
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

//need to think about this function
async function collateDbAndIgdbGames(Game, searchTerm){
    
    let response = await searchForGames(searchTerm);

    if(response.status !== 200){
        return {
            status: response.status,
            statusText: response.statusText
        }
    }

    const games = await Game.model.find({displayName: { $regex: searchTerm, $options: 'i' }})
    .select("igdbId displayName image")
    .exec();

    console.log(games);

    // other way of searching text
    // const games = await Game.model.find({$text: {$search: searchTerm}})
    // .select("igdbId displayName image")
    // .exec();

    const ids = games.map((data) => {
        return data.igdbId;
    });

    const responseData = response.data;
    
    const gameData = [...games];

    responseData.forEach((data) => {
        if(!ids.includes(data.id)){
            gameData.push({
                igdbId: data.id,
                displayName: data.name,
                image: getGameImageUrl(data)
            });
        }
    });
    
    const gameNames = gameData.map((data) => {
        return data.displayName.toLowerCase();
    });

    const results = stringSimilarity.findBestMatch(searchTerm, gameNames).ratings;

    results.sort(function(a, b){
        if(a.rating > b.rating){
            return -1;
        }

        if(a.rating < b.rating){
            return 1;
        }

        return 0;
    });

    console.log("--results--");
    console.log(results);

    const resultGameData = [];
    const searchThreshold = 0.2;

    for(let i = 0; i < results.length; i++){
        const result = results[i];

        if(result.rating > searchThreshold){
            for(let j = 0; j < gameData.length; j++){
                let data = gameData[j];
                if(result.target === data.displayName.toLowerCase()){
                    resultGameData.push(data);
                    gameData.splice(j, 1);
                    break;
                }
            }
        }
    }

    return resultGameData;
}


async function findGameByIgdbId(id){
    let gameData = await axios({
        url: "https://api-v3.igdb.com/games",
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'user-key': process.env.IGDB_KEY,
        },
        data: `fields id,name,summary,url,cover.url,first_release_date; where id = ${id};`
    });

    return gameData.data[0];
}

module.exports = {
    findGameByIgdbId: findGameByIgdbId,
    collateDbAndIgdbGames: collateDbAndIgdbGames
}