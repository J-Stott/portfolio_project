import { getMoreContent, createGameHeader, createContent, createButton } from "./scroll_functions.js";

const container = document.querySelector(".content-container");

let atBottom = false;
let moreContentToLoad = true;

let index = 1;

window.onscroll = function (event) {
    if (!atBottom) {
        if (window.innerHeight + window.pageYOffset >= document.body.offsetHeight - 2) {
            atBottom = true;

            if (moreContentToLoad) {
                const url = `${window.location.pathname}/${index}`;
                console.log(url);
                getMoreContent(url, container, createGameHeader, createContent, createButton, (moreToLoad) => {
                    moreContentToLoad = moreToLoad;
                    index++;
                });
            }
        }
    } else {
        if (window.innerHeight + window.pageYOffset < document.body.offsetHeight) {
            atBottom = false;
        }
    }
}