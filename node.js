const keys = {
  clientID: process.env.GOOGLE_ID,
  clientSecret: process.env.GOOGLE_SECRET
};

const express = require('express');
const path = require('path');
const port = process.env.POST || 2000;
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const url = 'mongodb://localhost:27017';
const dbName = 'toDoList';


let app = express();


app.use(express.static('./views'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

const GoogleStrategy = require('passport-google-oauth20');
let passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

let session = require("express-session");
let bodyParser = require("body-parser");
app.use(bodyParser.json());

app.use(express.static("public"));
app.use(session({
  secret: "cats"
}));
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(passport.initialize());
app.use(passport.session());

let userId;
MongoClient.connect(url, function(err, client) {
  const db = client.db(dbName);
  const userCollection = db.collection('users');

  passport.serializeUser((user, done) => done(null, user.id));

  passport.deserializeUser(function(id, done) {
    userCollection.findOne({
      id: id
    }).then(user => done(null, user));
  });


  passport.use(
    new GoogleStrategy(
      {
        callbackURL: '/loggedIn',
        clientID: keys.clientID,
        clientSecret: keys.clientSecret,
      },
      function(accessToken, refreshToken, profile, done) {
        userCollection.findOne({
          id: profile.id
        }).then(user => {
          if (user) return done(null, user);
          let newUser = {
            id: profile.id,
            todo: []
          };
          userCollection.save(newUser).then(() => {
            done(null, newUser);
          });
        });
      }
    )
  );

  app.get('/id', (req, res) => {
    res.send(userid);
  });


  app.get('/', (req, res) => {
    res.render('index');
  });
  app.get('/loggedInList', (req, res) => {
    res.render('index')
  });

  app.get('/loggedIn', passport.authenticate('google', {
    successRedirect: '/loggedInList',
    failureRedirect: '/login'
  }));

  app.get('/login',
    passport.authenticate('google', {
      scope: ['profile'],
      session: false
    })
  );
});



app.listen(port, () => {
  console.log(`Listening on ports ${port}`);
});
