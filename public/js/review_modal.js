import { setupModal, deleteProfileOrReviewHandler } from "./modal_functions.js";

let deleteButton = document.querySelector("#delete");

if(deleteButton){
    deleteButton.onclick = () => {
        setupModal("#review-modal", deleteProfileOrReviewHandler,"WARNING - Are you sure you want to delete this review?");
    };
}