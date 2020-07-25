const mongoose = require("mongoose");

//setup user schema
const latestSchema = new mongoose.Schema({
    igdbId: {type: Number},
    name: {type: String},
    image: {type: String},
    numReviews: {type: Number},
    ratingAverages: {
        gameplay: { type : Number },
        visuals: { type : Number },
        audio: { type : Number },
        story: { type : Number },
        overall: { type : Number },
    }
});

const Latest = mongoose.model("Latest", latestSchema);

module.exports = Latest;