//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();

console.log(process.env.SECRET);

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

mongoose.connect("mongodb://localhost:27017/userSecretDB");

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const User = new mongoose.model("User", userSchema);

app.get("/", function (req, res) {
  res.render("home");
});
app.get("/login", function (req, res) {
  res.render("login");
});

// connecting the register.ejs file and a post to create from the form in the register route
app.get("/register", function (req, res) {
  res.render("register");
});

app.post("/register", function (req, res) {
  bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
    const newUser = new User({
      email: req.body.username, // < this get the username data from the form in register.ejs
      password: hash, //< this get the password data from the form in register.ejs
    });
    newUser.save(function (err) {
      if (err) {
        console.log();
      } else {
        res.render("secrets"); // only render the sercets page unless the user is login in. (from the register route)
      }
    });
    // Store hash in your password DB.
  });
});

app.post("/login", function (req, res) {
  const username = req.body.username;
  const password = req.body.password;
  User.findOne({ email: username }, function (err, foundUser) {
    if (err) {
      // if there an error then log it
      console.log(err);
    } else {
      if (foundUser) {
        // else if the foundUSer does exit in the DB 👇
        // Load hash from your password DB.
        bcrypt.compare(password, foundUser.password, function (err, result) {
          if (result === true) {
            // and if that user's password exactly matches the this password
            res.render("secrets"); // then they pass authentication and can access their secets page(login successfull)
          }
        });
      }
    }
  });
});

// port connection on localHost 3000
app.listen(3000, function () {
  console.log("Server stated on Port 3000");
});
