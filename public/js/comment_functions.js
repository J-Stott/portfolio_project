import { createComment, removeComment } from "./creation_functions.js";

export function deleteComment(url, container, successCallback){
    axios({
        url: url,
        method: 'POST',
        })
        .then(response => {
            successCallback(container);
        })
        .catch(err => {
            console.error(err);
    });
}


export function editComment(url, comment, container, clone, successCallback){
    axios({
        url: url,
        method: 'POST',
        data: {
            comment: comment
        }
        })
        .then(response => {
            let commentData = response.data;

            successCallback(container, clone, commentData.comment);
        })
        .catch(err => {
            console.error(err);
    });
}

export function postComment(url, comment, container, successCallback){
    axios({
        url: url,
        method: 'POST',
        data: {
            comment: comment
        }
        })
        .then(response => {
            let commentData = response.data;
            successCallback(container, commentData);
        })
        .catch(err => {
            console.error(err);
    });
}