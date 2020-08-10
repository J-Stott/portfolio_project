import {removeComment} from "./creation_functions.js";

export function setCommentButtonEvents(element, editEvent, deleteEvent){
    let editButton = element.querySelector(".comment-edit");
    let deleteButton = element.querySelector(".comment-delete");

    editButton.addEventListener("click", () => {
        editEvent(element);
    });

    deleteButton.addEventListener("click", () => {
        //something with axios
        const commentId = element.getAttribute("data-commentId");
        const url = `${window.location.pathname}/comments/${commentId}/remove`;
        console.log(url);
        deleteEvent(url, element, removeComment);
    });
}

export function addCommentButtonEvents(userData, editEvent, deleteEvent){
    let userComments = document.querySelectorAll(`[data-userId="${userData.id}"]`);

    userComments.forEach((comment) => {
        setCommentButtonEvents(comment, editEvent, deleteEvent);
    });
}