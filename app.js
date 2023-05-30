// //jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();
const port = 3000;
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true });

// Mongoose schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

// Encryption

userSchema.plugin(encrypt, {
  secret: process.env.SECRET_KEY,
  encryptedFields: ["password"],
});
//

const User = new mongoose.model("User", userSchema);

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

//// The register route and only will render the secrets
app.post("/register", async (req, res) => {
  try {
    const newUser = new User({
      email: req.body.username,
      password: req.body.password,
    });

    await newUser.save();
    res.render("secrets");
  } catch (err) {
    console.log(err);
  }
});

app.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  User.findOne({ email: username })
    .then((foundUser) => {
      if (foundUser) {
        if (foundUser.password === password) {
          res.render("secrets");
        }
      }
    })
    .catch((err) => {
      console.error(err); // Handle the error here
      res.status(500).send("Internal Server Error");
    });
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});