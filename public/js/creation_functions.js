import {setCommentButtonEvents, setEditButtonEvents} from "./button_events.js"

//gives us an element and applies any attributes we specify
function createElement(elementType, attributes = null){
    let element = document.createElement(elementType);

    if(attributes !== null){
        for (const [key, value] of Object.entries(attributes)) {
            element.setAttribute(key, value);
        }
    }

    return element;
}

function createCommentButtons(container){
    let buttonCol = createElement("div", {
        class: "col-12 d-flex justify-content-md-end justify-content-center mt-3"
    });

    let editButton = createElement("button", {
        class: "btn btn-outline-light comment-edit"
    });

    editButton.innerText = "Edit Comment";

    let deleteButton = createElement("button", {
        class: "btn btn-danger ml-2 comment-delete"
    });

    deleteButton.innerText = "Delete Comment";

    buttonCol.appendChild(editButton);
    buttonCol.appendChild(deleteButton);
    container.appendChild(buttonCol);
}


//comment functions
//creates a new comment when user adds one
export function createComment(container, comment){

    console.log(container);

    let parent = createElement("div", {
        class: "content-wrapper wrapper-style mb-4"
    });

    let row = createElement("div", {
        class: "row comment-container",
    });

    row.setAttribute("data-comment-id", comment._id);
    row.setAttribute("data-user-id", comment.user._id);

    let imgCol = createElement("div", {
        class: "col-md-2 col-4 d-flex flex-column align-items-center"
    });

    let image = createElement("img", {
        class: "review-profile-picture",
        src: comment.user.profileImg,
        alt: comment.user.displayName
    });

    let name = createElement("p");
    name.innerText = comment.user.displayName;

    imgCol.appendChild(image);
    imgCol.appendChild(name);
    row.appendChild(imgCol);

    let commentCol = createElement("div", {
        class: "col-md-10 col-8"
    });

    let commentPar = createElement("p", {
        class: "comment"
    });
    commentPar.innerText = comment.comment;

    commentCol.appendChild(commentPar);
    row.appendChild(commentCol);

    createCommentButtons(row);

    setCommentButtonEvents(row);

    parent.appendChild(row);
    container.appendChild(parent);
}

//removes a comment when deleted
export function removeComment(comment){
    let parent = comment.parentNode;
    parent.remove();
}

//sets the content for a comment when edited or edit is cancelled
export function setCommentContent(container, clone, newComment = null){
    container.innerHTML = "";
    let children = [ ...clone.children ];

    children.forEach((child) => {
        container.appendChild(child);
    })

    setCommentButtonEvents(container);

    if(newComment){
        let comment = container.querySelector(".comment");
        comment.innerText = newComment;
    }
}

//adds the edit box and buttons when trying to edit a comment
export function addEditBox(container){

    let clone = container.cloneNode(true);

    container.innerHTML = "";

    let textCol = createElement("div", {
        class: "col-12 mt-3"
    });

    let text = createElement("textarea", {
        class: "form-control",
        name: "edit",
        id: "edit-text",
        rows: 3
    });

    let comment = clone.querySelector(".comment");
    text.required = true;
    text.value = comment.innerText;

    textCol.appendChild(text);
    container.appendChild(textCol);

    let buttonCol = createElement("div", {
        class: "col-12 d-flex justify-content-md-end justify-content-center mt-3"
    });

    let cancel = createElement("button", {
        class: "btn btn-outline-light edit-cancel"
    });

    cancel.innerText = "Cancel";

    buttonCol.appendChild(cancel);
    let edit = createElement("button", {
        class: "btn btn-outline-light ml-2 edit-submit"
    });

    edit.innerText = "Comment!";

    buttonCol.appendChild(edit);
    container.appendChild(buttonCol);

    setEditButtonEvents(container, clone);
}

//review functions

function createGameImage(review, container){
    let gameImgContainer = createElement("div", {
        class: "col-lg-2 col-md-3 col-4 d-flex justify-content-center"
    });

    let gameLink = createElement("a", {
        class: "user-link",
        href: `/games/${review.gameId.linkName}`
    });

    let gameImg = createElement("img", {
        class: "review-game-art mb-2",
        src: review.gameId.image,
        alt: review.gameId.displayName
    });

    gameLink.appendChild(gameImg);
    gameImgContainer.appendChild(gameLink);

    container.appendChild(gameImgContainer);
}

function createTitleHeading(review, container){
    let title = createElement("h1", {
        class: "mb-4",
    });

    title.innerText = review.gameId.displayName;
    container.appendChild(title);
}

function createStars(review, container){
    let starsContainer = createElement("div", {
        class: "stars",
    });

    for(let i = 0; i < review.ratings.overall; i++){
        starsContainer.innerHTML += `<i class="far fa-star star-highlight head-star-size"></i> `;
    }

    for(let i = 0; i < 5 - review.ratings.overall; i++){
        starsContainer.innerHTML += `<i class="far fa-star star-lowlight head-star-size"></i> `;
    }
    
    container.appendChild(starsContainer);
}

function createDateParagraph(review, container){
    let published = createElement("p", {
        class: "review-date"
    });
    let date = new Date(review.created);
    published.innerText = `Published on ${date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) }`;

    container.appendChild(published);

    if(review.edited !== null){
        let edited = createElement("p", {
            class: "review-date"
        });
        let em = createElement("em");
        let date = new Date(review.edited);
        em.innerText = `Last edited on ${date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) }`;
        edited.appendChild(em);
        container.appendChild(edited);
    }
}

//creates header for reviews on Index page
export function createIndexHeader(review){
    //headings
    let headRow = createElement("div", {
        class: "row"
    });

    createGameImage(review, headRow);

    let titleContainer = createElement("div", {
        class: "col-lg-10 col-md-9 col-8",
    });


    createTitleHeading(review, titleContainer);

    let userInfoContainer = createElement("div", {
        class: "row align-items-begin",
    });

    let profileImgContainer = createElement("div", {
        class: "col-lg-1 col-md-2 col-3",
    });

    let profileImg = createElement("img", {
        class: "review-profile-picture",
        src: review.author.profileImg,
        alt: review.author.displayName
    });
    profileImgContainer.appendChild(profileImg);
    userInfoContainer.appendChild(profileImgContainer);

    let profileNameContainer = createElement("div", {
        class: "col-lg-11 col-md-10 col-9",
    });

    let userName = createElement("h5", {
        class: "user-link",
    });
    userName.innerHTML = `By <a class="user-link" href="/users/${review.author.displayName}">${review.author.displayName}</a>`;
    profileNameContainer.appendChild(userName);

    createStars(review, profileNameContainer);
    createDateParagraph(review, profileNameContainer);

    userInfoContainer.appendChild(profileNameContainer);
    titleContainer.appendChild(userInfoContainer);
    headRow.appendChild(titleContainer);

    return headRow;
}

//creates header for reviews on user page
export function createUserHeader(review){
    //headings
    let headRow = createElement("div", {
        class: "row"
    });

    createGameImage(review, headRow);

    let titleContainer = createElement("div", {
        class: "col-lg-10 col-md-9 col-8",
    });

    createTitleHeading(review, titleContainer);

    createStars(review, titleContainer);

    createDateParagraph(review, titleContainer);

    headRow.appendChild(titleContainer);

    return headRow;
}

//creates header for reviews on game page
export function createGameHeader(review){
    //headings
    let headRow = createElement("div", {
        class: "row align-items-center"
    });

    let userImgContainer = createElement("div", {
        class: "col-lg-2 col-md-3 col-4"
    });

    let profileImg = createElement("img", {
        class: "profile-picture",
        src: review.author.profileImg,
        alt: review.author.displayName
    });

    userImgContainer.appendChild(profileImg);
    headRow.appendChild(userImgContainer);

    let titleContainer = createElement("div", {
        class: "col-lg-10 col-md-9 col-8",
    });

    let title = createElement("h5");

    title.innerHTML = `By <a class="user-link" href="/users/${review.author.displayName}">${review.author.displayName}</a>`;
    titleContainer.appendChild(title);

    createStars(review, titleContainer);
    createDateParagraph(review, titleContainer);

    headRow.appendChild(titleContainer);

    return headRow;
}

//creates content for reviews
export function createContent(review){
    //content
    let contentRow = createElement("div", {
        class: "row"
    });

    let contentContainer = createElement("div", {
        class: "col-12"
    }); 

    let reviewHeading = createElement("h2"); 
    reviewHeading.innerText = review.title;
    contentContainer.appendChild(reviewHeading);

    let reviewContent = createElement("p", {
        class: "review-content"
    });

    if(review.content.length > 300) {
        reviewContent.innerText = review.content.slice(0, 300) + " ...";
    } else {
        reviewContent.innerText = review.content
    }

    contentContainer.appendChild(reviewContent);
    contentRow.appendChild(contentContainer);

    return contentRow;
}

//creates read review button
export function createButton(review){
    let buttonRow = createElement("div", {
        class: "row"
    });

    let buttonContainer = createElement("div", {
        class: "col-12 d-flex justify-content-end"
    });

    let button = createElement("a", {
        class: "btn btn-outline-light",
        href: `/reviews/${review._id}`
    });

    button.innerText = "Read Review";
    buttonContainer.appendChild(button);
    buttonRow.appendChild(buttonContainer);

    return buttonRow;
}

//creates a review style based on the construction functions we pass in
export function createReview(container, review, headerFunc, contentFunc, buttonFunc){
    
    let parent = createElement("div", {
        class: "content-wrapper wrapper-style mb-4"
    });

    let headRow = headerFunc(review);
    parent.appendChild(headRow);

    let hr = createElement("hr", {
        class: "light"
    });
    parent.appendChild(hr);

    //content
    let contentRow = contentFunc(review);
    parent.appendChild(contentRow);

    //button
    let buttonRow = buttonFunc(review);
    parent.appendChild(buttonRow)

    container.appendChild(parent);
}


