require("dotenv").config();
const app = require("./backend/components/express_app");
const home = require("./backend/routes/home");
const profile = require("./backend/routes/profile");
const review = require("./backend/routes/review");
const user = require("./backend/routes/user");
const draft = require("./backend/routes/draft");

app.use("/", home);
app.use("/profile", profile);
app.use("/reviews", review);
app.use("/users", user);
app.use("/drafts", draft);

app.listen(app.get("port"), function () {
    console.log("app listening on port " + app.get("port"));
});