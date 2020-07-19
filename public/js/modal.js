var modal = document.querySelector("#myModal");

// Get the button that opens the modal
var btn = document.querySelector("#delete");

var cancelButton = document.querySelector("#close");
console.log(cancelButton);

// When the user clicks on the button, open the modal
btn.onclick = function() {
  modal.style.display = "block";
}

cancelButton.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
} 