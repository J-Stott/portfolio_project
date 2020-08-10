import {createReview} from "./creation_functions.js";

export function getMoreContent(url, container, headerFunc, contentFunc, buttonFunc, successCallback){
    axios({
        url: url,
        method: 'GET'
        })
        .then(response => {
            const data = response.data;

            data.forEach((review) => {
                createReview(container, review, headerFunc, contentFunc, buttonFunc);
            });

            successCallback(data.length > 0);
        })
        .catch(err => {
            console.error(err);
    });
}