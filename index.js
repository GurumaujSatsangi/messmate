import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import User from "./models/userModel.js";
import LHMenu from "./models/lhmenuModel.js";
import MHMenu from "./models/mhmenuModel.js";
import passport from "passport";
import { Strategy } from "passport-local";
import session from "express-session";
import { dirname } from "path";
import { fileURLToPath } from "url";
import flash from 'connect-flash';

const __dirname = dirname(fileURLToPath(import.meta.url));

const App = express();
App.use(flash());
const PORT = 3000;
App.use(express.static(__dirname));

App.use(
  session({
    secret: "TOPSECRETWORD",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 },
  })
);

mongoose.connect(
  "mongodb+srv://gurumaujsatsangi:ICb7Am2HA2rRsq5V@cluster0.ckh6k.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
);

App.use(bodyParser.urlencoded({ extended: true }));
App.use(bodyParser.json());

App.use(passport.initialize());
App.use(passport.session());
App.set("views", __dirname + "/views");
App.set("view engine", "ejs");
App.post("/signup", async (req, res) => {
  try {
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      hostel: req.body.hostel,
      mess: req.body.mess,
      password: req.body.password,
    });
    await newUser.save();
    req.flash("success", "Form data saved successfully!"); // Flash a success message
    res.redirect("/signup"); // Redirect to the signup page or another route
  } catch (error) {
    req.flash("error", "Error saving form data: " + error.message); // Flash the error message
    res.redirect("/signup"); // Redirect to the signup page or another route
  }
});

App.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

App.get("/login", (req, res) => {
  const messages = req.flash("error"); // Retrieve error flash messages
  res.render("login.ejs", { messages });
});

App.get("/signup", (req, res) => {
  const successMessage = req.flash("success");
  const errorMessage = req.flash("error");
  res.render("signup.ejs", { successMessage, errorMessage });
});

App.get("/", (req, res) => {
  res.render("home.ejs");
});

App.get("/home", (req, res) => {
  res.render("home.ejs");
});


App.get("/dashboard", (req, res) => {
  if (req.isAuthenticated()) {
    const loggedInUser = req.user; // Passport stores the authenticated user's data in req.user
    res.render("dashboard.ejs", { user: loggedInUser }); // Pass the logged-in user's data to the EJS template
  } else {
    res.redirect("/login");
  }
});

passport.use(
  new Strategy(
    { usernameField: "email" }, // Explicitly define email as username field
    async function (email, password, cb) {
      try {
        const user = await User.findOne({ email }); // Find user by email
        if (!user || user.password !== password) {
          return cb(null, false, { message: "Invalid credentials" });
        }
        return cb(null, user);
      } catch (error) {
        return cb(error);
      }
    }
  )
);

passport.serializeUser((user, cb) => {
  cb(null, user.id); // Serialize the user's ID
});

passport.deserializeUser(async (id, cb) => {
  try {
    const user = await User.findById(id); // Find user by ID
    cb(null, user);
  } catch (error) {
    cb(error);
  }
});

App.get("/error", (req, res) => {
  res.render("error.ejs");
});

App.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
