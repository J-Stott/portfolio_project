import { getMoreContent } from "./scroll_functions.js";
import { createIndexHeader, createContent, createButton } from "./creation_functions.js";

const container = document.querySelector(".content-container");

let atBottom = false;
let moreContentToLoad = true;

let index = 1;

window.onscroll = function (event) {
    if (!atBottom) {
        if (window.innerHeight + window.pageYOffset >= document.body.offsetHeight - 2) {
            atBottom = true;

            if (moreContentToLoad) {
                const url = `/latests/${index}`;
                getMoreContent(url, container, createIndexHeader, createContent, createButton, (moreToLoad) => {
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