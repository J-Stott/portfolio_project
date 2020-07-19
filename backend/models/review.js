const mongoose = require("mongoose");

//setup user schema
const reviewSchema = new mongoose.Schema({
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
});


const Review = mongoose.model("Review", reviewSchema);
const Draft = mongoose.model("Draft", reviewSchema);

module.exports = {
    review: Review,
    draft : Draft
};