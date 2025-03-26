import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import User from "./models/userModel.js";
import LHMenuVeg from "./models/lhmenuvegModel.js";
import Admin from "./models/adminModel.js";
import LHMenuNonVeg from "./models/lhmenunonvegModel.js";
import LHMenuSpecial from "./models/lhmenuspecialModel.js";

import MHMenuVeg from "./models/mhmenuvegModel.js";
import MHMenuNonVeg from "./models/mhmenunonvegModel.js";

import MHMenuSpecial from "./models/mhmenuspecialModel.js";

import passport from "passport";
import { Strategy } from "passport-local";
import session from "express-session";
import { dirname } from "path";
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

import { fileURLToPath } from "url";
import flash from "connect-flash";

const __dirname = dirname(fileURLToPath(import.meta.url));

const App = express();
App.use(flash());
const PORT = process.env.PORT || 3000;
App.use(express.static(path.join(__dirname, 'public')));

App.use(
  session({
    secret: "TOPSECRETWORD",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 },
  })
);

mongoose.connect(process.env.MONGODB_URI, {
  
});

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
      hostelType: req.body.hostelType,
      hostel: req.body.hostel,
      messType: req.body.messType,
      mess: req.body.mess,
      password: req.body.password,
    });
    await newUser.save();
    req.flash("success", "Form data saved successfully!"); // Flash a success message
    res.redirect("/login"); // Redirect to the signup page or another route
  } catch (error) {
    req.flash("error", "Error saving form data: " + error.message); // Flash the error message
    res.redirect("/signup"); // Redirect to the signup page or another route
  }
});

App.post("/update", async (req, res) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "Unauthorized access!");
    return res.redirect("/login");
  }

  try {
    const filter = { email: req.user.email };
    console.log(req.user.email);
    const update = {
      $set: {
        hostelType: req.body.hostelType,
        hostel: req.body.hostel,
        messType: req.body.messType,
        mess: req.body.mess,
      },
    };

    const result = await User.updateOne(filter, update);

    if (result.modifiedCount > 0) {
      req.flash("success", "Profile updated successfully!");
    } else {
      req.flash("error", "No changes were made.");
    }

    res.redirect("/dashboard");
  } catch (error) {
    console.error("Error updating document:", error);
    req.flash("error", "Error updating user details.");
    res.redirect("/dashboard");
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

App.get("/admin/login", (req, res) => {
  const messages = req.flash("error"); // Retrieve error flash messages
  res.render("admin/login", { messages });
});

App.get("/admin/dashboard", async (req, res) => {
  if (req.isAuthenticated()) {
    const loggedInAdmin = req.user;
    res.render("admin/dashboard", {
      admin: loggedInAdmin,
     
      successMessage: req.flash("success"),
      errorMessage: req.flash("error"),
    });

    // Set formmodel based on user's hostel and mess type

  } else {
    res.redirect("/admin/login");
  }
});

// Add a new strategy for admin authentication
passport.use("admin-local",
  new Strategy(
    { usernameField: "email" }, // Explicitly define email as username field
    async function (email, password, cb) {
      try {
        const admin = await Admin.findOne({ email }); // Find user by email
        if (!admin || admin.password !== password) {
          return cb(null, false, { message: "Invalid credentials" });
        }
        return cb(null, admin);
      } catch (error) {
        return cb(error);
      }
    }
  )
);

App.post(
  "/admin/login",
  passport.authenticate("admin-local", {
    successRedirect: "/admin/dashboard",
    failureRedirect: "/admin/login",
    failureFlash: true,
  })
);



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

var ht = "none";
var mt = "none";
var formmodel = "none";
var dbcollection = "none";

App.get("/dashboard", async (req, res) => {
  if (req.isAuthenticated()) {
    const loggedInUser = req.user;

    // Set formmodel based on user's hostel and mess type
    if (req.user.hostelType === "Mens") {
      if (req.user.messType === "Veg") {
        formmodel = MHMenuVeg;
      } else if (req.user.messType === "NonVeg") {
        formmodel = MHMenuNonVeg;
      } else if (req.user.messType === "Special") {
        formmodel = MHMenuSpecial;
      }
    } else if (req.user.hostelType === "Ladies") {
      if (req.user.messType === "Veg") {
        formmodel = LHMenuVeg;
      } else if (req.user.messType === "NonVeg") {
        formmodel = LHMenuNonVeg;
      } else if (req.user.messType === "Special") {
        formmodel = LHMenuSpecial;
      }
    }

    if (!formmodel) {
      req.flash("error", "Invalid form model.");
      return res.redirect("/dashboard");
    }

    try {
      const filter = { submitted_by: req.user.name };

      const results = await formmodel.find(filter);
      console.log(results);

      res.render("dashboard", {
        user: loggedInUser,
        results,
        successMessage: req.flash("success"),
        errorMessage: req.flash("error"),
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      req.flash("error", "Error fetching data.");
      res.redirect("/dashboard");
    }
  } else {
    res.redirect("/login");
  }
});

App.post("/suggestion", async (req, res) => {
  try {
    if (formmodel === "none") {
      throw new Error("Invalid form model");
    }

    const newSuggestion = new formmodel({
      submitted_by: req.user.name,
      hostel_type: req.user.hosteltype,
      block: req.user.hostel,
      mess_type: req.user.messtype,
      mess: req.user.mess,
      breakfast: req.body.breakfast,
      lunch: req.body.lunch,
      snacks: req.body.snacks,
      dinner: req.body.dinner,
    });

    await newSuggestion.save();

    req.flash("success", "Suggestion saved succesfully!");
    res.redirect("/dashboard"); // Redirect to the dashboard after submission
  } catch (error) {
    req.flash("error", "Error saving suggestion: " + error.message);
    res.redirect("/dashboard");
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
  cb(null, { id: user.id, type: user instanceof Admin ? "admin" : "user" });
});

passport.deserializeUser(async (obj, cb) => {
  try {
    let user;
    if (obj.type === "admin") {
      user = await Admin.findById(obj.id);
    } else {
      user = await User.findById(obj.id);
    }
    cb(null, user);
  } catch (error) {
    cb(error);
  }
});


App.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("success", "Logged out successfully!");
    res.redirect("/login");
  });
});

App.get("/admin/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("success", "Logged out successfully!");
    res.redirect("/admin/login");
  });
});

App.get("/error", (req, res) => {
  res.render("error.ejs");
});

App.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
