import { createComment, setCommentContent, removeComment } from "./creation_functions.js";

export function deleteComment(url, container){
    axios({
        url: url,
        method: 'POST',
        })
        .then(response => {
            removeComment(container);
        })
        .catch(err => {
            console.error(err);
    });
}


export function editComment(url, comment, container, clone){
    axios({
        url: url,
        method: 'POST',
        data: {
            comment: comment
        }
        })
        .then(response => {
            let commentData = response.data;

            setCommentContent(container, clone, commentData.comment);
        })
        .catch(err => {
            console.error(err);
    });
}

export function postComment(url, comment, container){
    axios({
        url: url,
        method: 'POST',
        data: {
            comment: comment
        }
        })
        .then(response => {
            let commentData = response.data;
            createComment(container, commentData);
        })
        .catch(err => {
            console.error(err);
    });
}