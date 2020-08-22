const express = require("express");
const router = express.Router();
const passport = require("passport");
const _ = require("lodash");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const oauthClient = require("../components/google_oauth");
const User = require("../models/user");
const Review = require("../models/review");
const Reset = require("../models/password_reset");
const settings = require("../../settings");


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

        const reviews = await Review.getSetNumberOfReviews({}, index * settings.NUM_REVIEWS_TO_GET);

        res.status(200).send(reviews);
    } catch(err) {
        console.log(err);
    }
    
});

//register page
router.get("/register", function (req, res) {
    if (req.isAuthenticated()) {
        res.render("/");
    } else {
        res.render("register");
    }
    
});

//register new user and save credentials to db
router.post("/register", function (req, res) {

    const username = _.toLower(req.body.username);
    const displayName = req.body.username;
    const email = _.toLower(req.body.email);
    const password = req.body.password;

    //add user to database and authenticate them if successful
    User.model.register({ username: username, displayName: displayName, email: email }, password, function (err, user) {
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

//forgot password page
router.get("/forgot", function (req, res) {
    if (req.isAuthenticated()) {
        res.redirect("/");
    } else {
        res.render("forgot");
    }
});


router.post("/forgot", async function (req, res) {

    try{
        if (req.isAuthenticated()) {
            res.redirect("/");
        } else {
            const userCredentials = _.toLower(req.body.username);
    
            const user = await User.model.findOne({$or: [{username: userCredentials}, {email: userCredentials}]}).exec();
    
            if(!user){
                return res.render("forgot_response", {
                    heading:"Forgot Password",
                    message: "The user or email could not be found."
                });
            }
    
            const buf = crypto.randomBytes(30);
            
            const token = `${user.username}-${buf.toString("hex")}`;
            const reset = new Reset.model({
                token: token,
                user: user._id,
            });
    
            await reset.save();

            const accessToken = await oauthClient.getAccessToken();
    
            const smtpTransport = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    type: "OAuth2",
                    user: process.env.GOOGLE_EMAIL,
                    clientId: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
                    accessToken: accessToken
                }
            });
    
            const mailOptions = {
                from: process.env.GOOGLE_EMAIL,
                to: user.email,
                subject: "Regular Reviews Password Reset",
                text: `You are receiving this email because you (or someone else) has requested a password reset on the account linked to this email address.
    
                Please click on the following link, or paste this into your browser to complete the process:
    
                http://${req.headers.host}/reset/${token}
    
                If you did not request this, please ignore this email and your password will remain unchanged.
                `
            };
    
            smtpTransport.sendMail(mailOptions, function(err) {
                if(!err){
                    res.render("forgot_response", {
                        heading:"Forgot Password",
                        message: "A reset link has been sent to your email address."
                    });
                } else {
                    console.log(err);
                }
            });
        }
    } catch(err) {
        console.log(err);
    }

});

//reset password page
router.get("/reset/:token", async function (req, res) {
    try{
        if (req.isAuthenticated()) {
            res.redirect("/");
        } else {
            const token = req.params.token;
    
            const reset = await Reset.model.findOne({token: token}).exec();
    
            if(!reset){
                res.render("forgot_response", {
                    heading:"Reset Password",
                    message: "This reset link is either invalid or has expired."
                });
            } else {
                res.render("reset", {token: token});
            }
        }
    } catch(err) {
        console.log(err);
    }

});

//reset password page
router.post("/reset/:token", async function (req, res) {

    try{
        if (req.isAuthenticated()) {
            res.redirect("/");
        } else {
            const token = req.params.token;
            const newPassword = req.body.password;
    
            const reset = await Reset.model.findOne({token: token}).exec();

            if(!reset){
                return res.render("forgot_response", {
                    heading:"Reset Password",
                    message: "This reset link is either invalid or has expired."
                });
            }
    
            const user = await User.model.findOne({_id: reset.user}).exec();
    
            if(!user){
                await Reset.model.deleteOne({token: token}).exec();
                return res.render("forgot_response", {
                    heading:"Reset Password",
                    message: "This user doesn't exist. How are you here?"
                });
            } else {
                user.setPassword(newPassword, async function(err, newPasswordUser){
                    if(!err) {
                        await newPasswordUser.save();
                        await Reset.model.deleteOne({token: token}).exec();
                        return res.render("forgot_response", {
                            heading:"Reset Password",
                            message: "Password successfully reset"
                        });
                    }
                })
            }
        }
    } catch(err) {
        console.log(err);
    }
});

router.get("/privacy", function (req, res) {

    try {
        let user = null;

        if (req.isAuthenticated()) {
            user = req.user;
        }

        res.render("privacy", {user: user});
    } catch(err) {
        console.log(err);
    }
    
});

router.get("/terms", function (req, res) {

    try {
        let user = null;

        if (req.isAuthenticated()) {
            user = req.user;
        }

        res.render("terms", {user: user});
    } catch(err) {
        console.log(err);
    }
    
});

router.get("/cookies", function (req, res) {

    try {
        let user = null;

        if (req.isAuthenticated()) {
            user = req.user;
        }

        res.render("cookies", {user: user});
    } catch(err) {
        console.log(err);
    }
    
});

router.get("/getuserdata", async function (req, res) {

    try {
        if(req.isAuthenticated()){
            const response = {
                id: req.user._id,
                username: req.user.username,
                roles: req.user.roles
            };

            res.status(200).send(response);
        } else {
            res.status(200).send(null);
        }
        
    } catch(err) {
        console.log(err);
    }
    
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