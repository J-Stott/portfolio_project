const mongoose = require("mongoose");

//setup user schema
const latestSchema = new mongoose.Schema({
    review: {type: mongoose.Schema.Types.ObjectId, ref: "Review"}
});

const Latest = mongoose.model("Latest", latestSchema);

module.exports = Latest;