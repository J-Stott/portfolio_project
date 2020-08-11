import { postComment } from "./comment_functions.js";
import { addCommentButtonEvents } from "./button_events.js";
let userData = null;

const commentsContainer = document.querySelector("#comments-container");

//check if we have a comments container, then set up comment text
if(commentsContainer !== null){
    const button = document.querySelector("#comment-submit"); 

    if(button != null){
        const commentText = document.querySelector("#comment-text");

        button.addEventListener("click", function(){
            console.log("click");
            const comment = commentText.value;
            let url = `${window.location.pathname}/comments/add`;
            postComment(url, comment, commentsContainer);
            commentText.value = "";
        });
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