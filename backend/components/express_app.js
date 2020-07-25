require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const session = require("express-session");
const mongoose = require("mongoose");
const cors = require("cors");
const mongoStore = require('connect-mongo')(session);

//connect to db
mongoose.connect(process.env.DB_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

mongoose.set('useCreateIndex', true);

//setup app
const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors());
app.use(express.static("public"));
app.set("port", process.env.PORT || 3000);

//setup session
app.use(session({
    secret: process.env.USER_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new mongoStore({ 
        mongooseConnection: mongoose.connection,
        autoRemove: 'interval',
        autoRemoveInterval: 60,
        touchAfter: 24 * 3600,
        secret: process.env.SESSION_SECRET
    })
}));

app.use(passport.initialize());
app.use(passport.session());

module.exports = app;