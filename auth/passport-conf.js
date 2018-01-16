const mongoose = require('mongoose');
const userSchema = require('../models/user.model');
const User = mongoose.model('User', userSchema);
const mongoMiddlewares = require('../dal/mongo');
const crypto = require('crypto');

const passportHandlers = {
  generateHash: (username, password) => crypto.createHmac('sha256', password).update(username).digest('hex'),

  signup: (req, username, password, done) => {
      username = username.toLowerCase();
      const {firstName, lastName, city, street} = req.body;
      const hash = passportHandlers.generateHash(username, password);
      const newUser = new User({firstName, lastName, username, password: hash, city, street})
      newUser.save((err, user) => {
        if (err) {
          return done(err);
        }
        return done(null, user);
      })  
  },

  login: (username, password, done) => {
    username = username.toLowerCase();
    User.findOne({username}, (err, user) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, {message: 'Username not found.'});
      }
      const hash = passportHandlers.generateHash(username, password); 
      if (user.password !== hash) {
        return done(null, false, {message: 'Incorrect password.'});
      }
      return done(null, user);
    });
  },

  serializeUser: (user, done) => done(null, user),

  deserializeUser: (user, done) => done(null, user),

  validatedUser: (req, res, next) => {
      if (req.isAuthenticated()) {
          return next();
      }
      return res.sendStatus(401);
  },

  socialUserExist: (accessToken, refreshToken, profile, done) => {
    User.findOne({"profile.id": profile.id}, (err, user) => {
      if (err) {
        return err;
      }
      if (user) {
        user.profile = profile;
        return done(false, user);
      }
      passportHandlers.createSocialUser(accessToken, refreshToken, profile, done);
    })
  },
  
  createSocialUser: (accessToken, refreshToken, profile, done) => {
    const u1 = new User({accessToken, refreshToken, profile: profile._json});
    u1.save(err => {
      return done(false, {profile})
    })
  }
}

module.exports = passportHandlers;