const ratingButtons = [];
const ratings = ["informative", "funny", "troll"];

function getURL(button){
    let path = window.location.pathname;
    let buttonName = button.name;
    return `${path}/${buttonName}`;
}

ratings.forEach((ratingName) => {
    ratingButtons.push(document.querySelector(`#${ratingName}`));
});

console.log(ratingButtons);

ratingButtons.forEach(function(button) {
    button.addEventListener("click", function(){
        console.log(getURL(button));
        axios({
            url: getURL(button),
            method: 'POST'
          })
            .then(response => {
                const responseData = response.data;
                console.log(responseData);
            })
            .catch(err => {
                console.error(err);
        });
    });
});


