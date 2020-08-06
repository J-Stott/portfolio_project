function createElement(elementType, attributes = null){
    let element = document.createElement(elementType);

    if(attributes !== null){
        for (const [key, value] of Object.entries(attributes)) {
            element.setAttribute(key, value);
        }
    }

    
    return element;
}

export function createIndexHeader(review){
    //headings
    let headRow = createElement("div", {
        class: "row"
    });

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
    headRow.appendChild(gameImgContainer);

    let titleContainer = createElement("div", {
        class: "col-lg-10 col-md-9 col-8",
    });

    let title = createElement("h1", {
        class: "mb-4",
    });

    title.innerText = review.gameId.displayName;
    titleContainer.appendChild(title);

    let userInfoContainer = createElement("div", {
        class: "row align-items-center",
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

    let starsContainer = createElement("div", {
        class: "stars",
    });

    for(let i = 0; i < review.ratings.overall; i++){
        starsContainer.innerHTML += `<i class="far fa-star star-highlight"></i> `;
    }

    for(let i = 0; i < 5 - review.ratings.overall; i++){
        starsContainer.innerHTML += `<i class="far fa-star star-lowlight"></i> `;
    }

    profileNameContainer.appendChild(starsContainer);
    userInfoContainer.appendChild(profileNameContainer);
    titleContainer.appendChild(userInfoContainer);
    headRow.appendChild(titleContainer);

    return headRow;
}


export function createUserHeader(review){
    //headings
    let headRow = createElement("div", {
        class: "row"
    });

    let gameImgContainer = createElement("div", {
        class: "col-lg-2 col-md-3 col-4"
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
    headRow.appendChild(gameImgContainer);

    let titleContainer = createElement("div", {
        class: "col-lg-10 col-md-9 col-8",
    });

    let title = createElement("h1");

    title.innerText = review.gameId.displayName;
    titleContainer.appendChild(title);

    let starsContainer = createElement("div", {
        class: "stars",
    });

    for(let i = 0; i < review.ratings.overall; i++){
        starsContainer.innerHTML += `<i class="far fa-star star-highlight"></i> `;
    }

    for(let i = 0; i < 5 - review.ratings.overall; i++){
        starsContainer.innerHTML += `<i class="far fa-star star-lowlight"></i> `;
    }

    titleContainer.appendChild(starsContainer);
    headRow.appendChild(titleContainer);

    return headRow;
}

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

    let starsContainer = createElement("div", {
        class: "stars",
    });

    for(let i = 0; i < review.ratings.overall; i++){
        starsContainer.innerHTML += `<i class="far fa-star star-highlight"></i> `;
    }

    for(let i = 0; i < 5 - review.ratings.overall; i++){
        starsContainer.innerHTML += `<i class="far fa-star star-lowlight"></i> `;
    }

    titleContainer.appendChild(starsContainer);
    headRow.appendChild(titleContainer);

    return headRow;
}

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

export function createReview(container, review, headerFunc, contentFunc, buttonFunc){
    
    let parent = createElement("div", {
        class: "review-wrapper wrapper-style mb-4"
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

export function getMoreContent(url, container, headerFunc, contentFunc, buttonFunc, successCallback){
    axios({
        url: url,
        method: 'GET'
        })
        .then(response => {
            const data = response.data;
            console.log(data);

            data.forEach((review) => {
                createReview(container, review, headerFunc, contentFunc, buttonFunc);
            });

            successCallback(data.length > 0);
        })
        .catch(err => {
            console.error(err);
    });
}