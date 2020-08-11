import { deleteComment } from "./comment_functions.js"
import { addEditBox } from "./creation_functions.js";

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

export function addCommentButtonEvents(userData){
    let userComments = document.querySelectorAll(`[data-user-id="${userData.id}"]`);

    userComments.forEach((comment) => {
        setCommentButtonEvents(comment);
    });
}