import { createComment, setCommentContent, removeComment } from "./creation_functions.js";

//sends comment data to server then populates comment if successful
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

//sends comment data to server then populates comment if successful
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
            console.log(commentData);

            setCommentContent(container, clone, commentData.comment);
        })
        .catch(err => {
            console.error(err);
    });
}

//sends delete data to server then removes comment if successful
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
