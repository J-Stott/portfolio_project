const mongoose = require("mongoose");

//setup user schema
const reactionSchema = new mongoose.Schema({

    review: {type: mongoose.Schema.Types.ObjectId, ref: "Review" },
    reaction: {
        informative: {type: Number, default: 0},
        funny: {type: Number, default: 0},
        troll: {type: Number, default: 0},
    },

    userReactions: [{ 
        user: {type: mongoose.Schema.Types.ObjectId, ref: "User" },
        userReaction: {
            informative: {type: Number, default: 0},
            funny: {type: Number, default: 0},
            troll: {type: Number, default: 0},
        }
    }],
});

const Reaction = mongoose.model("Reaction", reactionSchema);

module.exports = Reaction;