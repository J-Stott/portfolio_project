const igdbId = document.querySelector("#igdbId");
const gameName = document.querySelector("#gameName");
const gameTitle = document.querySelector("#gameTitle");
const searchContainer = document.querySelector(".search-results-container");

let ignoreUnfocus = false;

function setSearchVisible(visible){
    if(visible){
        searchContainer.style.display = "inherit";
        ignoreUnfocus = true;
    } else {
        searchContainer.style.display = "none";
        ignoreUnfocus = false;
    }
}

function clearSearchContainer(){
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

//gets our game data from
function getGameData(){
    let value = gameTitle.value;
    value = value.replace(/\s+/g, '-').toLowerCase();
    console.log(value);
    if(value !== ""){
        let url = `/games/search/${value}`;
        axios({
            url: url,
            method: 'POST',
            cancelToken: new CancelToken(function executor(c) {
                cancel = c;
            })
          })
            .then(response => {
                const gameData = response.data;

                if(gameData.length > 0){

                    clearSearchContainer();

                    gameData.forEach((data) => {
                        setSearchData(data);
                    });
    
                    setSearchVisible(true);
                }

            })
            .catch(err => {
                console.error(err);
        });
    }
}

function setSearchData(data){
    let parent = document.createElement("div");
    parent.setAttribute("class", "row align-items-center m-auto");

    let imgDiv = document.createElement("div");
    imgDiv.setAttribute("class", "col-md-2 col-3");

    let img = document.createElement("img");
    img.setAttribute("src", data.image);
    img.setAttribute("class", "search-game-art");

    imgDiv.appendChild(img);

    let textDiv = document.createElement("div");
    textDiv.setAttribute("class", "col-md-10 col-9");

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
        setSearchVisible(false);
    });

    searchContainer.appendChild(parent);
}

gameTitle.addEventListener("keydown", function(){
    if(cancel !== null){
        cancel("Operation cancelled by user");
        cancel = null;
    }

    setSearchVisible(false);
});

gameTitle.addEventListener("keyup", function(){
    if(gameTitle.value != ""){
        clearTimeout(timeoutId);
        timeoutId = setTimeout(getGameData, 1000);
    }
});

gameTitle.addEventListener("focusout", function(){
    if(!ignoreUnfocus){
        gameTitle.value = gameName.value;
    }
});

// window.onload = function(){
//     igdbId.value = "";
//     gameName.value = "";
//     gameTitle.value = "";
// }