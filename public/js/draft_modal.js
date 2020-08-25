import { setupModal } from "./modal_functions.js";

function setupDraftModal(){
    let deleteButtons = document.querySelectorAll(".delete-draft");

    if(deleteButtons.length > 0){
        deleteButtons.forEach((deleteButton) => {

            deleteButton.onclick = () => {
                const draftId = deleteButton.getAttribute("data-draft-id");
                console.log(draftId);
                setupModal("#draft-modal", function(){
                    const form = document.createElement('form');
                    form.method = "POST";
                    form.action = `/drafts/${draftId}/delete`;
                
                    document.body.appendChild(form);
                    form.submit();
                }, "WARNING - Are you sure you want to delete this draft?");
            }
        });
    }
}

setupDraftModal();
