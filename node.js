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


let app =  express();


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
app.use(session({ secret: "cats" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

let userId;
MongoClient.connect(url, function(err, client) {
    const db = client.db(dbName);
    const userCollection = db.collection('users');

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        userCollection.find({'newUser.id': id}).toArray(function(err, docs) {
            assert.equal(err, null);
            userId = docs;
            console.log(userId)
        });
    });


    passport.use(
        new GoogleStrategy({
            callbackURL:'/loggedIn',
            clientID: keys.clientID,
            clientSecret: keys.clientSecret,
        },
        function(accessToken, refreshToken, profile, cb) {
            console.log('test');
            console.log(profile);
            userid = profile.id;
            console.log(userid);

                let newUser = profile.id;
                assert.equal(null, err);
                userCollection.find({"newUser.id": profile.id}).toArray(function(err, docs) {
                    assert.equal(err, null);
                    if(docs.length !== 0){
                        userCollection.insertOne({newUser}, function(err, result) {
                            assert.equal(err, null);
                            cb(null,newUser);
                        });
                    }
                    else{
                        cb(null,docs);
                    }
                });



            /*User.findOrCreate({ googleId: profile.id }, function (err, user) {
                console.log(profile.emails[0].value);
                userid = profile.id;
                return cb(err, user);

            });*/
        }
    ));

    app.get('/id', (req, res) =>{
        res.send(userid);
    });


    app.get('/', (req, res) =>{
        res.render('index');
    });
    app.get('/loggedInList', (req, res) =>{
        res.render('index')
    });
    // app.get('/loggedIn', passport.authenticate('google', {
    // //   failureDirect: '/login'
    // // }));
    //
    // app.get('/loggedIn',(req,res)=>{
    //     res.redirect('/')
    // })

    app.get('/loggedIn', passport.authenticate('google', {
        successRedirect: '/loggedInList',
        failureRedirect: '/login'
    }));

    app.get('/login',
        passport.authenticate('google', { scope: ['profile'],session: false})
    );
});



app.listen(port,() =>{
    console.log(`Listening on ports ${port}`);
});
