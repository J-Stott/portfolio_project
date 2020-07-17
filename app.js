require("dotenv").config();
const _ = require("lodash");
const User = require("./backend/models/user");
const app = require("./backend/components/express_app");
const passport = require("passport");
const profile = require("./backend/routes/profile");
const review = require("./backend/routes/review");
const Latest = require("./backend/models/latest");
const Review = require("./backend/models/review");

app.use("/profile", profile);
app.use("/reviews", review);

//routes
app.get("/", function (req, res) {

    let user = null;

    if (req.isAuthenticated()) {
        user = req.user;
        console.log(user);
    }

    Latest.find({}).populate({
        path: "review", 
        populate: {
            path: "author",
            model: "User",
            select: {"_id": 1, "displayName": 1, "profileImg": 1}
        }}).exec(function(err, docs){

        const reviews = docs.map((doc) => {
            return doc.review;
        });

        console.log(reviews);

        res.render("index", { user: user, reviews: reviews.reverse() });
    });
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

                    req.user = user;
                    res.redirect("/");
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

app.listen(app.get("port"), function () {
    console.log("app listening on port " + app.get("port"));
});