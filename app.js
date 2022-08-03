const session = require("express-session");
const express = require("express");
var helmet = require("helmet");
const MongoStore = require("connect-mongo")(session);
const path = require("path");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const messageRouter = require("./routes/messages");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
const indexRouter = require("./routes/index");
const userRouter = require("./routes/user");
const keys = require("./config/keys");
// require("dotenv").config();

//Mongoose Database setup
const mongoose = require("mongoose");
const mongoDb='mongodb+srv://wasim:1234@cluster0.u3sb4.mongodb.net/messageDB?retryWrites=true&w=majority';
mongoose.connect(mongoDb, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));
db.on("connected", () => console.log("DB Connected"));

const app = express();

app.use(helmet());

//Passport config
require("./config/passport")(passport);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
const hbs = require("hbs");
hbs.registerPartials(__dirname + "/views/partials");

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser(keys.key));

app.use(
  session({
    store: new MongoStore({ mongooseConnection: db })
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));
app.use(flash());

app.use(function(req, res, next) {
  if (req.user) {
    res.locals.currentUserIsMember = req.user.isMember;
    res.locals.currentUserIsAdmin = req.user.isAdmin;
  }
  // Should do something about this
  res.locals.currentUser = req.user;
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.info_msg = req.flash("info_msg");
  res.locals.error = req.flash("error");

  next();
});

// Routes
app.use("/messages", messageRouter);
app.use("/users", ensureAuthenticated, userRouter);
app.use("/", ensureNotAuthenticated, indexRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`app listening on port ${port}`));

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  else res.redirect("/login");
}

function ensureNotAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) return next();
  else res.redirect("/users/dashboard");
}
