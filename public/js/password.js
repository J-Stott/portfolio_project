//allows us to validate password entry on register and change password screens
let password = document.querySelector("#password");
let confirmPassword = document.querySelector("#password-confirm");

function validatePassword(){
    if(password.value !== confirmPassword.value){
        confirmPassword.setCustomValidity("Passwords Don't Match");
    } else {
        confirmPassword.setCustomValidity('');
    }
}

password.onchange = validatePassword;
confirmPassword.onchange = validatePassword;
