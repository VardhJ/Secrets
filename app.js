//jshint esversion:6

require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
//const encrypt = require("mongoose-encryption")
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


//for hashing:
// const md5 = require("md5");

//bcrypt
// const bcrypt = require("bcrypt");
// const saltRounds = 10;

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
  secret: "Oursecretyes.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);

//ENCRYPTION:
//secret code in .env
//userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });

const User = new mongoose.model("User", userSchema);

//PASSPORT, automatic salting and hashing:
// CHANGE: USE "createStrategy" INSTEAD OF "authenticate"
passport.use(User.createStrategy())

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", function(req, res){
  res.render("home");
});

app.get("/login", function(req, res){
  res.render("login");
});

app.get("/register", function(req, res){
  res.render("register");
});

app.get("/secrets", function(req, res){
  if(req.isAuthenticated()){
    res.render("secrets");
  }
  else{
    res.redirect("/login");
  }
});

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
})



app.post("/register", function(req, res){

  User.register({username: req.body.username}, req.body.password, function(err, user){
    if(err){
      console.log(err);
      res.redirect("/register");
    }
    else{
      passport.authenticate("local")(req,res, function(){
        res.redirect("/secrets");
      })
    }
  });

  //bcrypt:
  // bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
  //   const newUser = new User({
  //     email: req.body.username,
  //     //password: md5(req.body.password),   md5 encryption
  //     password: hash,                       //bcrypt encryption
  //   });
  //
  //   newUser.save(function(err){       //password is encrypted when save is called
  //     if(err){
  //       console.log(err);
  //     }
  //     else{
  //       res.render("secrets");      //only if valid
  //     }
  //   });
  // });

});

app.post("/login", function(req, res){

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
    if (err){
      console.log(err);
    } else {
        passport.authenticate("local")(req,res, function(){
        res.redirect("/secrets");
      });
    }
  });

  // const username = req.body.username;
  // const password = req.body.password;
  //
  // User.findOne({email: username}, function(err, foundUser){       //decrypted password here
  //   if(err){
  //     console.log(err);
  //   }
  //   else{
  //     if(foundUser){
  //       bcrypt.compare(password, foundUser.password, function(err, result) {
  //         if(result === true){
  //           res.render("secrets");
  //         }
  //       });
  //     }
  //   }
  // });

});


app.listen("3000", function(res, req){
  console.log("Successfully started on port 3000");
});
