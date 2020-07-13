require("dotenv").config();
const _ = require("lodash");
const User = require("./models/user");
const app = require("./components/express_app");
const passport = require("passport");
let upload = require("./components/profile_uploader");
const fs = require("fs");
const path = require("path");
const settings = require("./settings");

//routes
app.get("/", function (req, res) {

    let user = null;

    if (req.isAuthenticated()) {
        user = req.user;
        console.log(user);
    }

    res.render("index", { user: user });
});

app.get("/register", function (req, res) {
    res.render("register");
});


app.post("/register", function (req, res) {

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
                res.redirect("/profile");
            });
        }
    });
});

app.get("/login", function (req, res) {
    if (req.isAuthenticated()) {
        res.redirect("/");
    } else {
        res.render("login");
    }
});

app.post("/login", function (req, res, next) {
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

                    console.log("success");
                    return res.redirect("/");
                }
            });
        }

    })(req, res, next);
});

app.get("/logout", function (req, res) {

    if (req.isAuthenticated()) {
        req.logOut();
        req.session.destroy();
    }

    res.redirect("/");
});

app.get("/profile", function (req, res) {
    if (req.isAuthenticated()) {
        const user = req.user;
        const data = {
            user: user
        }

        if (req.session.userMessage !== null) {
            data.userMessage = req.session.userMessage;
            req.session.userMessage = null;
        }

        if (req.session.imageMessage !== null) {
            data.imageMessage = req.session.imageMessage;
            req.session.imageMessage = null;
        }

        res.render("profile", data);

    } else {
        res.redirect("/login");
    }
});

app.post("/profile/updateImage", upload.single("profile"), function (req, res) {
    if (req.isAuthenticated()) {
        //check if we have been given an appropriate file
        if (!req.file) {
            req.session.imageMessage = "Please provide a valid file. (.jpeg/.png)";
            res.redirect("/profile");
        } else {
            //update user profile path
            const user = req.user;
            const file = req.file;
            User.findById(user._id, function (err, foundUser) {

                foundUser.profileImg = "/profileImages/" + file.filename;
                foundUser.save(function (err) {
                    if (err) {
                        console.log(err)
                    } else {
                        res.redirect("/profile");
                    }
                })
            });
        }

    } else {
        res.redirect("/login");
    }
});

app.post("/profile/updateName", function (req, res) {
    if (req.isAuthenticated()) {
        const user = req.user;
        const displayName = req.body.displayName;

        //double check they have given us an appropriate name
        const lowerCaseUser = _.toLower(user.displayName);
        const lowerFormName = _.toLower(displayName);

        console.log(lowerCaseUser, "-", lowerFormName);

        if (lowerCaseUser !== lowerFormName) {
            req.session.userMessage = "Entered name does not match your username";
            res.redirect("/profile");
        } else {
            //update display name if successful
            User.findById(user._id, function (err, foundUser) {

                foundUser.displayName = displayName;

                foundUser.save(function (err) {
                    if (err) {
                        console.log(err)
                    } else {
                        res.redirect("/profile");
                    }
                })
            });
        }


    } else {
        res.redirect("/login");
    }
});

//clear out all user data
app.post("/profile/delete", function (req, res) {
    if (req.isAuthenticated()) {
        const user = req.user;

        //remove profile image
        if (user.profileImg !== settings.DEFAULT_PROFILE_IMG) {
            const fileName = path.join(__dirname, "public", user.profileImg);

            fs.unlink(fileName, (err) => {
                if (err) {
                    console.error(err);
                }
            });
        }


        User.deleteOne({ _id: user._id }, function (err) {

            if (err) {
                console.log(err)
            } else {
                res.redirect("/");
            }
        });

    } else {
        res.redirect("/login");
    }
});

app.listen(app.get("port"), function () {
    console.log("app listening on port " + app.get("port"));
});