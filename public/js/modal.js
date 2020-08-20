var modal = document.querySelector("#myModal");

// Get the button that opens the modal
var btn = document.querySelector("#delete");

var cancelButton = document.querySelector("#close");

if(btn !== null){
  // When the user clicks on the button, open the modal
  btn.onclick = function() {
    modal.style.display = "block";
  }

  cancelButton.onclick = function() {
    modal.style.display = "none";
  }

  window.addEventListener("click", function(){
    if (event.target == modal) {
      modal.style.display = "none";
    }
  });
}
