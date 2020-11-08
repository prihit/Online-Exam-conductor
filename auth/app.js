var express = require("express");
// var mongoose = require("mongoose");
var passport = require("passport");
var bodyParser = require("body-parser");
var passportLocal = require("passport-local");
// var passportLocalMongoose = require("passport-local-mongoose");
var User = require("./models/user");
// mongoose.connect("mongodb://localhost/auth_demo");
var app = express();
var flash = require('connect-flash');
app.use(bodyParser.urlencoded({extended: true}));
app.use(require("express-session")({
    secret: "who are you",
    resave: false,
    saveUninitialized: false
}))
User(passport);
app.set("view engine","ejs");
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
// passport.use(new passportLocal(User.authenticate()));
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());



app.get("/", function(req,res){
    res.render("home")
});

app.get("/secret", isLoggedIn, function(req,res){
    res.render("secret")
});

app.get("/register", function(req,res){
    res.render("register", { message: req.flash('signupMessage')});
});

app.post("/register", passport.authenticate('local-signup', {
    successRedirect: '/secret',
    failureRedirect: '/register',
    failureFlash: true
}), function(req,res){
    console.log("Register !!")
    console.log(req.body)
});
app.get("/loginstu", function(req,res){
    res.render("loginstu", {message: req.flash('loginMessage')});
});

app.post("/loginstu", passport.authenticate("local-loginstu", {
    successRedirect: "/secret",
    failureRedirect: "/loginstu",
    failureFlash: true
}), function(req,res){
    console.log(req.body)
});

app.get("/login", function(req,res){
    res.render("login", {message: req.flash('loginMessage')});
});

app.post("/login",passport.authenticate("local-login", {
    successRedirect: "/secret",
    failureRedirect: "/login",
    failureFlash: true
}), function(req, res){
    console.log(req.body)
});

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}


app.listen(process.env.PORT || 1111, process.env.IP, function(){
    console.log("Server started at 1111");
})