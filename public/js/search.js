const navSearch = document.querySelector("#navSearch");
const navSearchContainer = document.querySelector(".nav-search-results-container");

//review creation and edit form
const igdbId = document.querySelector("#igdbId");
const gameName = document.querySelector("#gameName");
const gameTitle = document.querySelector("#gameTitle");
const reviewSearchContainer = document.querySelector(".search-results-container");

let ignoreUnfocus = false;

function setSearchVisible(searchContainer, visible){
    if(visible){
        searchContainer.style.display = "inherit";
        ignoreUnfocus = true;
    } else {
        searchContainer.style.display = "none";
        ignoreUnfocus = false;
    }
}

function clearSearchContainer(searchContainer){
    searchContainer.innerHTML = "";
}

function clearInputs(){
    igdbId.value = "";
    gameName.value = "";
    gameTitle.value = "";
}

let timeoutId = 0;

const CancelToken = axios.CancelToken;
let cancel = null;

//will display search results in a container
function displayGameSearch(response, container, dataSetter){
    const gameData = response.data;

    if(gameData.length > 0){

        clearSearchContainer(container);

        gameData.forEach((data) => {
            dataSetter(data, container);
        });

        setSearchVisible(container, true);
    }
}

/*Sets review search bar and will add appropriate data to hidden inputs in order to link review to appropriate game*/
function setReviewGameData(data, searchContainer){
    let parent = document.createElement("div");
    parent.setAttribute("class", "row align-items-center m-auto game");

    let imgDiv = document.createElement("div");
    imgDiv.setAttribute("class", "col-md-2 col-4");

    let img = document.createElement("img");
    img.setAttribute("src", data.image);
    img.setAttribute("class", "search-game-art");

    imgDiv.appendChild(img);

    let textDiv = document.createElement("div");
    textDiv.setAttribute("class", "col-md-10 col-8");

    let text = document.createElement("p");
    text.setAttribute("class", "search-game-text")
    text.innerText = data.displayName;
    textDiv.appendChild(text);

    parent.appendChild(imgDiv);
    parent.appendChild(textDiv);

    parent.addEventListener("click", function(){
        igdbId.value = data.igdbId;
        gameName.value = data.displayName;
        gameTitle.value = data.displayName;
        clearSearchContainer();
        setSearchVisible(searchContainer, false);
    });

    searchContainer.appendChild(parent);
}

/*creates panels for game searches. When clicked, will post to server and will either redirect if the game exists in the db or create that entry and then redirect*/
function setSearchGameData(data, searchContainer){

    let parent = document.createElement("div");
    parent.setAttribute("class", "row align-items-center m-auto game");

    let imgDiv = document.createElement("div");
    imgDiv.setAttribute("class", "col-md-2 col-4");

    let img = document.createElement("img");
    img.setAttribute("src", data.image);
    img.setAttribute("class", "search-game-art");

    imgDiv.appendChild(img);

    let textDiv = document.createElement("div");
    textDiv.setAttribute("class", "col-md-10 col-8 user-link");

    let text = document.createElement("p");
    text.setAttribute("class", "search-game-text")
    text.innerText = data.displayName;
    textDiv.appendChild(text);

    parent.appendChild(imgDiv);
    parent.appendChild(textDiv);

    parent.addEventListener("click", function(){
        const form = document.createElement('form');
        form.method = "POST";
        form.action = `/games/${data.linkName}`;

        const hiddenField = document.createElement('input');
        hiddenField.type = 'hidden';
        hiddenField.name = "igdbId";
        hiddenField.value = data.igdbId;

        form.appendChild(hiddenField);
        document.body.appendChild(form);
        form.submit();
    });

    searchContainer.appendChild(parent);
}

//gets our game data from the igdb and our database
function getGameData(searchInput, responseCallback){
    let value = searchInput.value;
    value = value.replace(/\s+/g, '-').toLowerCase();
    if(value !== ""){
        let url = `/games/search/${value}`;
        axios({
            url: url,
            method: 'POST',
            cancelToken: new CancelToken(function executor(c) {
                cancel = c;
            })
          })
            .then(responseCallback)
            .catch(err => {
                console.error(err);
        });
    }
}

//nav search events
navSearch.addEventListener("keydown", function(){
    if(cancel !== null){
        cancel("Operation cancelled by user");
        cancel = null;
    }

    setSearchVisible(navSearchContainer, false);
});

navSearch.addEventListener("keyup", function(){
    if(navSearch.value != ""){
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            getGameData(navSearch, (response) => {
                displayGameSearch(response, navSearchContainer, setSearchGameData);
            });
        }, 500);
    } else {
        clearInputs();
    }
});

navSearch.addEventListener("focusout", function(){
    setTimeout(() => {
        setSearchVisible(navSearchContainer, false);
    },100)
});

//if we are on a creation/edit page, add event listeners
if(gameTitle !== null){
    gameTitle.addEventListener("keydown", function(){
        if(cancel !== null){
            cancel("Operation cancelled by user");
            cancel = null;
        }
    
        setSearchVisible(reviewSearchContainer, false);
    });
    
    gameTitle.addEventListener("keyup", function(){
        if(gameTitle.value != ""){
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                getGameData(gameTitle, (response) => {
                    displayGameSearch(response, reviewSearchContainer, setReviewGameData);
                });
            }, 500);
        } else {
            clearInputs();
        }
    });
    
    gameTitle.addEventListener("focusout", function(){
        if(!ignoreUnfocus){
            gameTitle.value = gameName.value;
        }
    });
}


// window.onload = function(){
//     igdbId.value = "";
//     gameName.value = "";
//     gameTitle.value = "";
// }