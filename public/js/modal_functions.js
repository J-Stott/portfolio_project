let hideSetup = false;

function getModal(modalName){
  return document.querySelector(modalName);
}

function showModal(modal, show, innerText = ""){

  if(show){
    modal.style.display = "block";

    if(innerText !== ""){
      let text = modal.querySelector("p");
      text.innerText = innerText;
    }

  } else {
    modal.style.display = "none";
  }
}

function setupHideModalEvents(modal){
  if(!hideSetup){

    hideSetup = true;
    let closeButton = modal.querySelector("#modal-close");

    closeButton.onclick = function() {
      showModal(modal, false);
    }
  
    window.addEventListener("click", function(){
      if (event.target == modal) {
        showModal(modal, false);
      }
    });
  }
}

export function setModalVisible(modalName, visible){
  let modal = getModal(modalName);
  showModal(modal, visible);
}

export function deleteProfileOrReviewHandler(){

  const form = document.createElement('form');
  form.method = "POST";
  form.action = `${window.location.pathname}/delete`;

  document.body.appendChild(form);
  form.submit();
}

export function setupModal(modalName, deleteEvent, innerText = ""){
  let modal = getModal(modalName);
  let confirmButton = modal.querySelector("#modal-confirm");

  confirmButton.onclick = deleteEvent;

  setupHideModalEvents(modal);

  showModal(modal, true, innerText);
}

