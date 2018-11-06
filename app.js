const express = require("express");
const exphbs = require("express-handlebars");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
const keys = require("./config/keys");

//Load user  model
require("./models/user");

//Passport  config
require("./config/passport")(passport);

//Load routes
const auth = require("./routes/auth");
const index = require("./routes/index");

const app = express();

//Mongoose connect
mongoose
  .connect(
    keys.mongoURI,
    {
      useNewUrlParser: true
    }
  )
  .then(() => console.log("MongoDb connected.."))
  .catch(err => console.log(err));

//Handlebar middleware
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main"
  })
);
app.set("view engine", "handlebars");

app.use(cookieParser());
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false
  })
);

//Passport  middleware
app.use(passport.initialize());
app.use(passport.session());

//Set global vars
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

//use routes
app.use("/auth", auth);
app.use("/", index);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
