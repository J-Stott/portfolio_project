const mongoose = require("mongoose");

//setup user schema
const reviewSchema = new mongoose.Schema({
    gameId: { 
        type: mongoose.Schema.Types.ObjectId, ref: "Game"
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
    created: {type: Date, default: Date.now},
    reactions: {type: mongoose.Schema.Types.ObjectId, ref: "Reaction"}
});

const Review = mongoose.model("Review", reviewSchema);

async function createReview(user, game, reactions, req){
    //create new review
    const newReview = new Review({
        author: user._id,
        gameId: game._id,
        ratings: {
            //if user hasn't entered a rating, presume 0
            gameplay: "gameplay" in req.body ? Number(req.body.gameplay) : 0,
            visuals: "visuals" in req.body ? Number(req.body.visuals) : 0,
            audio: "audio" in req.body ? Number(req.body.audio) : 0,
            story: "story" in req.body ? Number(req.body.story) : 0,
            overall: "overall" in req.body ? Number(req.body.overall) : 0,
        },
        title: req.body.title,
        content: req.body.content,
        reactions: reactions._id,
    });

    let review = newReview.save();
    return review;
}

async function updateReview(reviewId, req){
    //create new review
    Review.updateOne({ _id: reviewId, author: req.user._id }, {
        gameData: {
            gameTitle: req.body.game,
        }, 
        title: req.body.title, 
        content: req.body.content, 
        ratings: {
            //if user hasn't entered a rating, presume 0
            gameplay: "gameplay" in req.body ? Number(req.body.gameplay) : 0,
            visuals: "visuals" in req.body ? Number(req.body.visuals) : 0,
            audio: "audio" in req.body ? Number(req.body.audio) : 0,
            story: "story" in req.body ? Number(req.body.story) : 0,
            overall: "overall" in req.body ? Number(req.body.overall) : 0,
        },
    }).exec();
}

module.exports = {
    model: Review,
    createReview: createReview,
    updateReview: updateReview
};
