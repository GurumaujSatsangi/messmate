import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import User from "../models/userModel.js";
import LHMenuVeg from "../models/lhmenuvegModel.js";
import Admin from "../models/adminModel.js";
import LHMenuNonVeg from "../models/lhmenunonvegModel.js";
import LHMenuSpecial from "../models/lhmenuspecialModel.js";
import serverless from "serverless-http";
import jsPDF from "jspdf";
import MHMenuVeg from "../models/mhmenuvegModel.js";
import MHMenuNonVeg from "../models/mhmenunonvegModel.js";

import MHMenuSpecial from "../models/mhmenuspecialModel.js";

import passport from "passport";
import { Strategy } from "passport-local";
import session from "express-session";
import { dirname } from "path";
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

import { fileURLToPath } from "url";
import flash from "connect-flash";
import Menu from "../models/menuModel.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const App = express();
App.use(bodyParser.urlencoded({ extended: true }));
App.use(bodyParser.json());
App.use(flash());
const PORT = process.env.PORT || 3000;
App.use(express.static(path.join(__dirname, '../public')));

App.use(session({
  secret: process.env.SESSION_SECRET || "TOPSECRET",
  resave: false,
  saveUninitialized: true,
  cookie: { 
    maxAge: 1000 * 60 * 60 
  }
}));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

App.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});



App.use(passport.initialize());
App.use(passport.session());
App.set("views", path.join(__dirname, "../views"));
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
  if (req.isAuthenticated() && req.user.isAdmin) {
    try {
      // Fetch all suggestions from all models
      const acceptedSuggestions = [];
      
      // Fetch from MH Veg
      const mhVegAccepted = await MHMenuVeg.find({ status: "Accepted" });
      acceptedSuggestions.push(...mhVegAccepted);
      
      // Fetch from MH Non Veg
      const mhNonVegAccepted = await MHMenuNonVeg.find({ status: "Accepted" });
      acceptedSuggestions.push(...mhNonVegAccepted);
      
      // Fetch from MH Special
      const mhSpecialAccepted = await MHMenuSpecial.find({ status: "Accepted" });
      acceptedSuggestions.push(...mhSpecialAccepted);
      
      // Fetch from LH Veg
      const lhVegAccepted = await LHMenuVeg.find({ status: "Accepted" });
      acceptedSuggestions.push(...lhVegAccepted);
      
      // Fetch from LH Non Veg
      const lhNonVegAccepted = await LHMenuNonVeg.find({ status: "Accepted" });
      acceptedSuggestions.push(...lhNonVegAccepted);
      
      // Fetch from LH Special
      const lhSpecialAccepted = await LHMenuSpecial.find({ status: "Accepted" });
      acceptedSuggestions.push(...lhSpecialAccepted);

      // Fetch all suggestions for display in accordions
      const results = await MHMenuVeg.find({});
      const results1 = await MHMenuNonVeg.find({});
      const results2 = await MHMenuSpecial.find({});
      const results3 = await LHMenuVeg.find({});
      const results4 = await LHMenuNonVeg.find({});
      const results5 = await LHMenuSpecial.find({});

      // Fetch current weekly menu
      const weeklyMenu = {};
      const menuItems = await Menu.find({});
      menuItems.forEach(item => {
        weeklyMenu[item.day] = {
          breakfast: item.breakfast,
          lunch: item.lunch,
          snacks: item.snacks,
          dinner: item.dinner
        };
      });

      res.render("admin/dashboard", {
        admin: req.user,
        results,
        results1,
        results2,
        results3,
        results4,
        results5,
        acceptedSuggestions,
        weeklyMenu,
        successMessage: req.flash("success"),
        errorMessage: req.flash("error"),
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      req.flash("error", "Error fetching data.");
      res.redirect("/admin/dashboard");
    }
  } else {
    res.redirect("/admin/login");
  }
});

// Add route to save weekly menu
App.post("/admin/save-menu", async (req, res) => {
  if (req.isAuthenticated() && req.user.isAdmin) {
    try {
      const menuData = req.body;
      
      // Delete existing menu items
      await Menu.deleteMany({});
      
      // Create menu items for each day
      const menuItems = Object.keys(menuData).map(day => ({
        day: day,
        breakfast: menuData[day].breakfast || '',
        lunch: menuData[day].lunch || '',
        snacks: menuData[day].snacks || '',
        dinner: menuData[day].dinner || ''
      }));
      
      // Insert new menu items
      await Menu.insertMany(menuItems);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving menu:", error);
      res.status(500).json({ success: false, error: "Error saving menu" });
    }
  } else {
    res.status(403).json({ success: false, error: "Unauthorized" });
  }
});

// Add a new strategy for admin authentication
passport.use("admin-local",
  new Strategy(
    { usernameField: "email" },
    async function (email, password, cb) {
      try {
        const admin = await Admin.findOne({ email });
        if (!admin) {
          return cb(null, false, { message: "Invalid email" });
        }
        if (admin.password !== password) {
          return cb(null, false, { message: "Invalid password" });
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
    let formmodel;
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
      return res.redirect("/login");
    }

    try {
      const filter = { submitted_by: req.user.name };
      const results = await formmodel.find(filter);

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

App.get("/delete", async (req, res) => {
  try {
    // Dynamically set the formmodel based on user's hostelType and messType
    let formmodel;
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

    // If formmodel is not set, throw an error
    if (!formmodel) {
      req.flash("error", "Invalid form model.");
      return res.redirect("/dashboard");
    }

    // Delete the suggestion based on the submitted_by field
    const filter = { submitted_by: req.user.name };
    const result = await formmodel.deleteOne(filter);

    if (result.deletedCount > 0) {
      req.flash("success", "Suggestion deleted successfully!");
    } else {
      req.flash("error", "No suggestion found to delete.");
    }

    res.redirect("/dashboard");
  } catch (error) {
    console.error("Error deleting suggestion:", error);
    req.flash("error", "Error deleting suggestion.");
    res.redirect("/dashboard");
  }
});


App.post("/suggestion", async (req, res) => {
  try {
    // Dynamically set the formmodel based on user's hostelType and messType
    let formmodel;
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

    // If formmodel is not set, throw an error
    if (!formmodel) {
      throw new Error("Invalid form model");
    }

    // Create a new suggestion document
    const newSuggestion = new formmodel({
      submitted_by: req.user.name,
      hostel_type: req.user.hostelType,
      block: req.user.hostel,
      mess_type: req.user.messType,
      mess: req.user.mess,
      breakfast: req.body.breakfast,
      lunch: req.body.lunch,
      snacks: req.body.snacks,
      dinner: req.body.dinner,
    });

    // Save the suggestion to the database
    await newSuggestion.save();

    req.flash("success", "Suggestion saved successfully!");
    res.redirect("/dashboard");
  } catch (error) {
    console.error("Error saving suggestion:", error);
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

App.get("/search", async (req, res) => {
  try {
    const { name } = req.query; // Get the student's name from the query string

    if (!name) {
      return res.status(400).json({ error: "Name is required for search." });
    }

    // Search across multiple collections using the 'submitted_by' field
    const results = await Promise.all([
      MHMenuVeg.find({ submitted_by: { $regex: name, $options: "i" } }),
      MHMenuNonVeg.find({ submitted_by: { $regex: name, $options: "i" } }),
      MHMenuSpecial.find({ submitted_by: { $regex: name, $options: "i" } }),
      LHMenuVeg.find({ submitted_by: { $regex: name, $options: "i" } }),
      LHMenuNonVeg.find({ submitted_by: { $regex: name, $options: "i" } }),
      LHMenuSpecial.find({ submitted_by: { $regex: name, $options: "i" } }),
    ]);

    // Combine results from all collections
    const combinedResults = results.flat();

    res.json(combinedResults);
  } catch (error) {
    console.error("Error searching for student:", error);
    res.status(500).json({ error: "An error occurred while searching for the student." });
  }
});


App.get("/accept", async (req, res) => {
  try {
    const suggestionId = req.query.id;
    const modelType = req.query.model;

    if (!suggestionId || !modelType) {
      req.flash("error", "Missing required parameters.");
      return res.redirect("/admin/dashboard");
    }

    // Determine which model to use based on the modelType
    let formmodel;
    switch (modelType) {
      case 'mhmenuveg':
        formmodel = MHMenuVeg;
        break;
      case 'mhmenunonveg':
        formmodel = MHMenuNonVeg;
        break;
      case 'mhmenuspecial':
        formmodel = MHMenuSpecial;
        break;
      case 'lhmenuveg':
        formmodel = LHMenuVeg;
        break;
      case 'lhmenunonveg':
        formmodel = LHMenuNonVeg;
        break;
      case 'lhmenuspecial':
        formmodel = LHMenuSpecial;
        break;
      default:
        req.flash("error", "Invalid model type.");
        return res.redirect("/admin/dashboard");
    }

    const filter = { _id: suggestionId };
    const update = {
      $set: {
        status: "Accepted",
      },
    };

    const result = await formmodel.updateOne(filter, update);

    if (result.modifiedCount > 0) {
      req.flash("success", "Suggestion accepted successfully!");
    } else {
      req.flash("error", "No changes were made.");
    }

    res.redirect("/admin/dashboard");
  } catch (error) {
    console.error("Error updating suggestion:", error);
    req.flash("error", "Error accepting the suggestion.");
    res.redirect("/admin/dashboard");
  }
});





passport.serializeUser((user, cb) => {
  cb(null, {
    id: user._id,
    isAdmin: user.isAdmin || false
  });
});

passport.deserializeUser(async (obj, cb) => {
  try {
    let user;
    if (obj.isAdmin) {
      user = await Admin.findById(obj.id);
      if (user) user.isAdmin = true;
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

if (process.env.NODE_ENV != "production") {
  App.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default App;
export const handler = serverless(App);
