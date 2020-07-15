const mongoose = require("mongoose");

//setup user schema
const reviewSchema = new mongoose.Schema({
    authorData: { 
        authorName: { type : String },
        authorProfileImg: { type : String }
    },
    gameData: { 
        gameTitle: { type : String },
        gameImg: { type : String }
    },
    ratings: {
        graphics: { type : Number },
        gameplay: { type : Number },
        music: { type : Number },
        story: { type : Number },
        overall: { type : Number },
    },
    heading: {type : String},
    content: {type : String},
});


const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;