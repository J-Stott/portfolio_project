const ratingInfo = [];
const ratings = ["informative", "funny", "troll"];

function getURL(buttonName){
    let path = window.location.pathname;
    return `${path}/${buttonName}`;
}

//sets up appropriate style of button depending on if it has been rated by the user
function setButtonStyle(button, reactionValue){

    if(reactionValue === 1){
        if(button.classList.contains("btn-outline-light")){
            button.classList.remove("btn-outline-light");
        } 

        button.classList.add("btn-light");
    } else {
        if(button.classList.contains("btn-light")){
            button.classList.remove("btn-light");
        } 

        button.classList.add("btn-outline-light");
    }
}

ratings.forEach((ratingName) => {
    ratingInfo.push({
        button: document.querySelector(`#${ratingName}`),
        span: document.querySelector(`#${ratingName}-span`),
    });
});

function getUserRating(){
    let url = `${window.location.pathname}/userRatings`;
    axios({
        url: url,
        method: 'GET'
      })
        .then(response => {
            const reactions = response.data.userReactions;

            if(reactions !== null){
                ratingInfo.forEach((info) => {
                    const reactionName = info.button.name;
                    const reactionValue = reactions[reactionName];
                    setButtonStyle(info.button, reactionValue);
                });
            }
        })
        .catch(err => {
            console.error(err);
    });
}

ratingInfo.forEach(function(info) {
    info.button.addEventListener("click", function(){
        const buttonName = info.button.name;
        axios({
            url: getURL(buttonName),
            method: 'POST'
          })
            .then(response => {
                const responseData = response.data;
                info.span.innerText = responseData[buttonName];
                setButtonStyle(info.button, responseData.userReactions[buttonName]);
            })
            .catch(err => {
                console.error(err);
        });
    });
});

window.addEventListener("load", function(){
    getUserRating();
});


