const keys = {
  clientID: process.env.GOOGLE_ID,
  clientSecret: process.env.GOOGLE_SECRET
};

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const port = process.env.POST || 2000;
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const url = 'mongodb://localhost:27017';
const dbName = 'userManager';

let app =  express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('./views'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

const GoogleStrategy = require('passport-google-oauth20');
let passport = require('passport');

let userid;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');



passport.use(
    new GoogleStrategy({
        callbackURL:'/loggedIn',
        clientID: keys.clientID,
        clientSecret: keys.clientSecret,
    },
    function(accessToken, refreshToken, profile, cb) {
        console.log('test');
        console.log(profile);
        /*User.findOrCreate({ googleId: profile.id }, function (err, user) {
            console.log(profile.emails[0].value);
            userid = profile.id;
            return cb(err, user);

        });*/
    }
));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('./views'));
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) =>{
    res.render('index');
});
app.get('/loggedIn', passport.authenticate('google', {
  failureDirect: '/login'
}));

app.get('/login',
    passport.authenticate('google', { scope: ['profile']})
);



app.listen(port,() =>{
    console.log(`Listening on ports ${port}`);
});
