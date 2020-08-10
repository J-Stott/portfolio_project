import { postComment, deleteComment } from "./comment_functions.js";
import { addEditBox } from "./creation_functions.js";
import { addCommentButtonEvents } from "./button_events.js";
import { createComment } from "./creation_functions.js";
let userData = null;

const commentsContainer = document.querySelector("#comments-container");

if(commentsContainer !== null){
    console.log("we have a container");
    const button = document.querySelector("#comment-submit"); 

    if(button != null){
        const commentText = document.querySelector("#comment-text");

        button.addEventListener("click", function(){
            console.log("click");
            const comment = commentText.value;
            let url = `${window.location.pathname}/comments/add`;
            postComment(url, comment, commentsContainer, createComment);
            commentText.value = "";
        });
    }
}

window.onload = function(){
    axios({
        url: "/getuserdata",
        method: 'GET',
        })
        .then(response => {
            const user = response.data;
            console.log(user);

            userData = user;

            addCommentButtonEvents(userData, addEditBox, deleteComment);
        })
        .catch(err => {
            console.error(err);
    });
}