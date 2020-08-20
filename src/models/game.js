const mongoose = require("mongoose");
const settings = require("../../settings");
const igdb = require("../components/igdb_functions");

let Mutex = require("async-mutex").Mutex;

const mutex = new Mutex();


//setup game schema
const gameSchema = new mongoose.Schema({
    igdbId: {type: Number},
    linkName: {type: String},
    displayName: {type: String},
    image: {type: String},
    summary: {type: String},
    numReviews: {type: Number, default: 0},
    releaseDate: {type: Date},
    ratingAverages: {
        gameplay: { type : Number, default: 0 },
        visuals: { type : Number, default: 0 },
        audio: { type : Number, default: 0 },
        story: { type : Number, default: 0 },
        overall: { type : Number, default: 0 },
    }
});

gameSchema.index({displayName: "text"});

const Game = mongoose.model("Game", gameSchema);

function getAfterLastSlash(str){
    const index = str.lastIndexOf('/');
    return str.substring(index + 1);
}

async function findOrCreateGameEntry(idgbId){
    //create game data here

    const release = await mutex.acquire();

    try{
        let game = await Game.findOne({igdbId: idgbId}).exec();

        if(game === null){
            
            let gameData = await igdb.findGameByIgdbId(idgbId);
        
            let imageUrl = settings.DEFAULT_GAME_IMAGE;
    
            if("cover" in gameData){
                imageUrl = gameData.cover.url
                imageUrl = `https:${imageUrl.replace("t_thumb", "t_cover_big")}`;
            }
    
            let date = new Date();
            if("first_release_date" in gameData){
                date = new Date(gameData.first_release_date * 1000);
            }
    
            const linkName = getAfterLastSlash(gameData.url);
    
            let newGame = new Game({
                igdbId: gameData.id,
                displayName: gameData.name,
                linkName: linkName,
                summary: gameData.summary,
                releaseDate: date,
                image: imageUrl
            });
    
            game = await newGame.save();
        }
        return game;
        
    } finally {
        release();
    }
}

//adds to the averages of a game
async function addToAverages(review){
    const ratings = review.ratings;

    let game = await Game.findOne({_id: review.gameId}).exec();

    Object.keys(game.ratingAverages).forEach(function(key){ 
        game.ratingAverages[key] *= game.numReviews 
        game.ratingAverages[key] += ratings[key];
    });

    game.numReviews++;
    
    Object.keys(game.ratingAverages).forEach(function(key){ 
        game.ratingAverages[key] /= game.numReviews 
    });

    game.save();
}

//removes the averages for a game
async function removeFromAverages(review){
    const ratings = review.ratings;

    let game = await Game.findOne({_id: review.gameId}).exec();

    Object.keys(game.ratingAverages).forEach(function(key){ 
        game.ratingAverages[key] *= game.numReviews 
        game.ratingAverages[key] -= ratings[key];
    });

    game.numReviews--;
    
    if(game.numReviews > 1){
        Object.keys(game.ratingAverages).forEach(function(key){ 
            game.ratingAverages[key] /= game.numReviews 
        });
    }

    game.save();
}

module.exports = {
    model: Game,
    findOrCreateGameEntry: findOrCreateGameEntry,
    addToAverages: addToAverages,
    removeFromAverages: removeFromAverages,
    getAfterLastSlash: getAfterLastSlash,
};