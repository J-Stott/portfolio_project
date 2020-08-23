import { setupModal, deleteProfileOrReviewHandler } from "./modal_functions.js";

let deleteButton = document.querySelector("#delete");

if(deleteButton){
    deleteButton.onclick = () => {
        setupModal("#profile-modal", deleteProfileOrReviewHandler,"WARNING - Deleting your account will remove all of your reviews. This cannot be reversed.")
    };
}
