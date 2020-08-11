import { postComment, deleteComment } from "./comment_functions.js";
import { addEditBox } from "./creation_functions.js";
import { addCommentButtonEvents } from "./button_events.js";
let userData = null;

const commentsContainer = document.querySelector("#comments-container");

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

window.addEventListener("load", function(){
    axios({
        url: "/getuserdata",
        method: 'GET',
        })
        .then(response => {
            userData = response.data;

            addCommentButtonEvents(userData, addEditBox, deleteComment);
        })
        .catch(err => {
            console.error(err);
    });
});