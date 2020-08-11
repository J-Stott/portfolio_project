import { addCommentButtonEvents, setCommentPostEvent } from "./button_events.js";
let userData = null;

const commentsContainer = document.querySelector("#comments-container");

//check if we have a comments container, then set up comment text
if(commentsContainer !== null){
    const button = document.querySelector("#comment-submit"); 

    if(button !== null){
        setCommentPostEvent(button, commentsContainer);
    }
}

//we get logged in user data, then use that to add comment events
window.addEventListener("load", function(){
    axios({
        url: "/getuserdata",
        method: 'GET',
        })
        .then(response => {
            userData = response.data;

            addCommentButtonEvents(userData);
        })
        .catch(err => {
            console.error(err);
    });
});