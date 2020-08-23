import { editComment, deleteComment, postComment } from "./comment_functions.js"
import { addEditBox, setCommentContent } from "./creation_functions.js";
import { setupModal, setModalVisible } from "./modal_functions.js";

//allows us to enable/disable comment buttons
//don't want to have multiple edits open at once
function enableAllCommentButtonsState(enabled){
    let editButtons = document.querySelectorAll(".comment-edit");
    let deleteButtons = document.querySelectorAll(".comment-delete");

    editButtons.forEach((button) => {
        button.disabled = !enabled;
    });

    deleteButtons.forEach((button) => {
        button.disabled = !enabled;
    });

    const commentButton = document.querySelector("#comment-submit"); 
    commentButton.disabled = !enabled;
}

export function setCommentPostEvent(button, container){
    const commentText = document.querySelector("#comment-text");

    button.addEventListener("click", function(){
        const comment = commentText.value;
        if (/\S/.test(comment)) {
            let url = `${window.location.pathname}/comments/add`;
            postComment(url, comment, container);
            commentText.value = "";
        }
    });
}

//sets initial comment button events
export function setCommentButtonEvents(element){
    console.log(element);
    let editButton = element.querySelector(".comment-edit");
    let deleteButton = element.querySelector(".comment-delete");

    editButton.addEventListener("click", () => {
        addEditBox(element);
        enableAllCommentButtonsState(false);
    });

    deleteButton.addEventListener("click", () => {
        //something with axios

        setupModal("#review-modal", function() {
            const commentId = element.getAttribute("data-comment-id");
            const url = `${window.location.pathname}/comments/${commentId}/remove`;
            deleteComment(url, element);
            setModalVisible("#review-modal", false);
        }, "WARNING - Are you sure you want to delete this comment?");
    });
}

//adds edit button event handlers
export function setEditButtonEvents(element, clone){
    let cancelButton = element.querySelector(".edit-cancel");
    let submitButton = element.querySelector(".edit-submit");

    cancelButton.addEventListener("click", () => {
        setCommentContent(element, clone);
        enableAllCommentButtonsState(true);
    });

    submitButton.addEventListener("click", () => {
        let text = element.querySelector("textarea");
        let textValue = text.value;
        const commentId = element.getAttribute("data-comment-id");
        const url = `${window.location.pathname}/comments/${commentId}/edit`;
        editComment(url, textValue, element, clone);
        enableAllCommentButtonsState(true);
    });
}

//checks for all comments based on user id and sets up button events on window load
export function addCommentButtonEvents(userData){
    let userComments = null
    
    if(userData.roles.includes("admin")){
        console.log("admin");
        userComments = document.querySelectorAll(`.comment-container`);
    } else {
        userComments = document.querySelectorAll(`[data-user-id="${userData.id}"]`);
    }


    userComments.forEach((comment) => {
        setCommentButtonEvents(comment);
    });
}