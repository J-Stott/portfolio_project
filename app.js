require("dotenv").config();
const app = require("./src/components/express_app");
const home = require("./src/routes/home");
const profile = require("./src/routes/profile");
const review = require("./src/routes/review");
const user = require("./src/routes/user");
const draft = require("./src/routes/draft");
const games = require("./src/routes/game.js");

app.use("/", home);
app.use("/profile", profile);
app.use("/reviews", review);
app.use("/users", user);
app.use("/drafts", draft);
app.use("/games", games);

app.listen(app.get("port"), function () {
    console.log("app listening on port " + app.get("port"));
});