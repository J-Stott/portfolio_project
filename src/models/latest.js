const mongoose = require("mongoose");

//setup user schema
const latestSchema = new mongoose.Schema({
    review: {type: mongoose.Schema.Types.ObjectId, ref: "Review"}
});

const Latest = mongoose.model("Latest", latestSchema);

async function getLatests(){
    let docs = Latest.find({})
        .populate({
            path: "review", 
            populate: {
                path: "author",
                model: "User",
                select: {"_id": 1, "displayName": 1, "profileImg": 1}
            },
        })
        .populate({
            path: "review", 
            populate: {
                path: "gameId",
                model: "Game",
                select: {"displayName": 1, "image": 1, "linkName": 1}
            }
        })
        .sort({review: "desc"})
        .exec();

    return docs;
}

module.exports = {
    model: Latest,
    getLatests: getLatests
};