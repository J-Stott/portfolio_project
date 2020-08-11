import { deleteComment } from "./comment_functions.js"
import { addEditBox } from "./creation_functions.js";

//sets initial comment button events
export function setCommentButtonEvents(element){
    let editButton = element.querySelector(".comment-edit");
    let deleteButton = element.querySelector(".comment-delete");

    editButton.addEventListener("click", () => {
        const commentId = element.getAttribute("data-comment-id");
        addEditBox(element);
    });

    deleteButton.addEventListener("click", () => {
        //something with axios
        const commentId = element.getAttribute("data-comment-id");
        const url = `${window.location.pathname}/comments/${commentId}/remove`;
        deleteComment(url, element);
    });
}

//checks for all comments based on user id and sets up button events on window load
export function addCommentButtonEvents(userData){
    let userComments = document.querySelectorAll(`[data-user-id="${userData.id}"]`);

    userComments.forEach((comment) => {
        setCommentButtonEvents(comment);
    });
}