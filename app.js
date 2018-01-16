const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const superRouter = require('./routers/super');
const authRouter = require('./routers/auth');
const async = require('async');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const passportConfig = require('./auth/passport-conf');
const fileUpload = require('express-fileupload');
const env = require('./env/env');
app.set('view engine', 'ejs');
const ejs = require('ejs');
const flash = require('connect-flash');
const UserSchema = require('./models/user.model');
const User = mongoose.model('User', UserSchema);
const mongoMiddlewares = require('./dal/mongo');


passport.use('local', new LocalStrategy(passportConfig.login));
passport.use('local-sign', new LocalStrategy({
  usernameField: 'user',
  passwordField: 'pass',
  passReqToCallback: true
}, passportConfig.signup));

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_SECRET_KEY,
  callbackURL: process.env.FACEBOOK_CB_URL,
  profileFields: ['id', 'displayName', 'photos', 'email']
}, (accessToken, refreshToken, profile, done) => passportConfig.socialUserExist(accessToken, refreshToken, profile, done)));

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_SECRET_KEY,
  callbackURL: process.env.GOOGLE_CB_URL
}, (accessToken, refreshToken, profile, done) => passportConfig.socialUserExist(accessToken, refreshToken, profile, done)));

passport.serializeUser(passportConfig.serializeUser);
passport.deserializeUser(passportConfig.deserializeUser);

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json());
app.use(cookieParser());

app.use(session({
  secret: process.env.SECRET_SESSION_KEY,
  resave: false,
  saveUninitialized: false,
  name: process.env.COOKIE_KEY_NAME,
  cookie: {
    httpOnly: false,
    maxAge: 1000 * 60 * 60 * 12 // 12 hours
  },
  store: new MongoStore({url: process.env.CONNECTION_STRING})
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static('public'));
app.use(fileUpload());

app.get('/', (req, res) => res.render('login.ejs', {error: req.flash('error')}))

app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/google', passport.authenticate('google', {scope: ['email','profile']}))

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: '/',
    failureRedirect: '/'
}));

app.get('/auth/google/callback',
  passport.authenticate('google',{
    failureRedirect: '/'
    }), (req, res) => {
    res.redirect('/');
})

app.use('/super', passportConfig.validatedUser, superRouter);
app.use('/auth', passportConfig.validatedUser, authRouter);
app.get('/userExist/:username', mongoMiddlewares.userExist, (req, res) => res.status(200).json({userExist: req.data}));
app.get('/details', mongoMiddlewares.fetchAllProducts, mongoMiddlewares.fetchAllOrders, (req, res) => res.status(200).json({products: req.products, orders: req.orders}));

app.post('/login',
    passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/',
      failureFlash: true
    })
);

app.post('/signup', 
    passport.authenticate('local-sign', {
      successRedirect: '/',
      failureRedirect: '/'
    })
);

app.get('/logout', (req, res) => {
  req.session.destroy();
  req.logout();
  res.redirect('/');
});

async.waterfall([
  callback => mongoose.connect(process.env.CONNECTION_STRING, {useMongoClient: true}, err => callback(err)),
  callback => app.listen(3000, err => callback(err))
], (err, results) => {
  if (err) {
    return console.log(err);
  }
  return console.log(`Server up and running on port 3000 and connected to mongo DB`);
});
