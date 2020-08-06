const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Review = require("../models/review");
const passport = require("passport");
const _ = require("lodash");


//routes
//shows latest reviews
router.get("/", async function (req, res) {

    try {
        let user = null;

        if (req.isAuthenticated()) {
            user = req.user;
        }
        const reviews = await Review.getSetNumberOfReviews({}, 0);

        res.render("index", { user: user, reviews: reviews });
    } catch(err) {
        console.log(err);
    }
    
});

router.get("/latests/:index", async function (req, res) {

    try {
        const index = Number(req.params.index);

        const reviews = await Review.getSetNumberOfReviews({}, index * 10);

        res.status(200).send(reviews);
    } catch(err) {
        console.log(err);
    }
    
});

//register page
router.get("/register", function (req, res) {
    res.render("register");
});

//register new user and save credentials to db
router.post("/register", function (req, res) {

    const username = _.toLower(req.body.username);
    const displayName = req.body.username;
    const email = _.toLower(req.body.email);
    const password = req.body.password;

    //add user to database and authenticate them if successful
    User.register({ username: username, displayName: displayName, email: email }, password, function (err, user) {
        if (err) {
            console.log(err);
            return res.render("register", { errorMsg: "Username or Email is already in use." })
        } else {
            passport.authenticate("local")(req, res, function () {
                const username = req.user.displayName;
                res.redirect(`/profile/${username}`);
            });
        }
    });
});

//login screen
router.get("/login", function (req, res) {
    if (req.isAuthenticated()) {
        res.redirect("/");
    } else {
        res.render("login");
    }
});

//validate login credentials sent over
router.post("/login", function (req, res, next) {
    const username = req.body.username;
    const remember = req.body.remember;
    passport.authenticate("local", function (err, user, info) {

        if (err) {
            console.log(err);
            return next(err);
        }

        if (!user) {
            return res.render("login", { username: username, errorMsg: "Invalid username or password." });
        } else {

            req.login(user, (loginErr) => {
                if (loginErr) {
                    return next(loginErr);
                } else {

                    //set cookie for 
                    if (remember) {
                        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; //30 days
                    } else {
                        req.session.cookie.expires = false; //expires at end of session
                    }

                    req.session.user = user;
                    res.redirect("/");
                }
            });
        }

    })(req, res, next);
});

//logout
router.get("/logout", function (req, res) {

    if (req.isAuthenticated()) {
        req.logOut();
        req.session.destroy();
    }

    res.redirect("/");
});

module.exports = router;