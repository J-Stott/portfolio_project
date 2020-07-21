const mongoose = require("mongoose");

//setup user schema
const draftSchema = new mongoose.Schema({
    gameData: { 
        gameTitle: { type : String },
        gameImg: { type : String }
    },
    ratings: {
        gameplay: { type : Number },
        visuals: { type : Number },
        audio: { type : Number },
        story: { type : Number },
        overall: { type : Number },
    },
    title: {type : String},
    content: {type : String},
    author: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    created: {type: Date, default: Date.now}
});

const Draft = mongoose.model("Draft", draftSchema);

module.exports = Draft;