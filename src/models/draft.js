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

function createDraft(user, req){
    const newDraft = new Draft({
        author: user._id,
        gameData: {
            gameTitle: req.body.game,
        },
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
    });


    let draft = newDraft.save();
    return draft
}

async function updateDraft(draftId, req){
    let update = Draft.updateOne({ _id: draftId, author: req.user._id }, {
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

    return update;
}

module.exports = {
    model: Draft,
    createDraft: createDraft,
    updateDraft: updateDraft
};