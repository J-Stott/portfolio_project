const ratingInfo = [];
const ratings = ["informative", "funny", "troll"];

function getURL(buttonName){
    let path = window.location.pathname;
    return `${path}/${buttonName}`;
}

ratings.forEach((ratingName) => {
    ratingInfo.push({
        button: document.querySelector(`#${ratingName}`),
        span: document.querySelector(`#${ratingName}-span`),
    });
});

console.log(ratingInfo);

ratingInfo.forEach(function(info) {
    info.button.addEventListener("click", function(){
        const buttonName = info.button.name;
        console.log(getURL(buttonName));
        axios({
            url: getURL(buttonName),
            method: 'POST'
          })
            .then(response => {
                const responseData = response.data;
                info.span.innerText = responseData[buttonName];
            })
            .catch(err => {
                console.error(err);
        });
    });
});


