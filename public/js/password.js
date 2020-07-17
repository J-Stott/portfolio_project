let password = document.querySelector("#password");
let confirmPassword = document.querySelector("#password-confirm");

function validatePassword(){
    if(password.value !== confirmPassword.value){
        console.log("No Password Matchy!");
        confirmPassword.setCustomValidity("Passwords Don't Match");
    } else {
        confirmPassword.setCustomValidity('');
    }
}

password.onchange = validatePassword;
confirmPassword.onchange = validatePassword;
