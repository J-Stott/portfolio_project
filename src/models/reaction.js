const mongoose = require("mongoose");
let Mutex = require("async-mutex").Mutex;

const updateReactionMutex = new Mutex();

//setup reaction schema
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

async function getUserReaction(reaction, user){

    let userReaction = reaction.userReactions.find((data) =>{
        return String(data.user) === String(user._id);
    });

    if(userReaction === undefined){
        return null;
    }

    console.log(userReaction);

    return userReaction;
}

async function updateUserReaction(reviewId, reactionName, user){

    const release = await updateReactionMutex.acquire();

    try{

        let reaction = await Reaction.findOne({review: reviewId}, "reaction userReactions")
        .exec();

        //check that a reaction exists for the logged in user
        let userReaction = await getUserReaction(reaction, user);
        
        if(userReaction === null){
            //create users reaction, bump appropriate reaction and save
            userReaction = { 
                user: user._id,
                userReaction: {
                    informative: 0,
                    funny: 0,
                    troll: 0,
                }
            };
            
            userReaction.userReaction[reactionName] = 1;
            reaction.userReactions.unshift(userReaction);
            reaction.reaction[reactionName]++;
            await reaction.save();
        } else {
            
            if(userReaction.userReaction[reactionName] == 0){
                reaction.reaction[reactionName]++;
                userReaction.userReaction[reactionName] = 1;
                await reaction.save();
            } else {
                reaction.reaction[reactionName]--;
                userReaction.userReaction[reactionName] = 0;
                await reaction.save();
            }
        }
        
        const response = {
            [reactionName]: reaction.reaction[reactionName],
            userReactions: userReaction.userReaction,
        }

        return response;
    } finally {
        release();
    }
}

module.exports = {
    model: Reaction,
    getUserReaction: getUserReaction,
    updateUserReaction: updateUserReaction
};