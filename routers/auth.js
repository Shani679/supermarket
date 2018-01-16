const express = require('express');
const router = express.Router();
const cartMiddlwares = require('../dal/cartMiddlwares');

const getResponseMiddleware = (req, res) => res.status(200).json({success: true, user: req.session.passport.user, lastOrder: req.data, openCart: req.session.cart});

router.get('/fetchUser', cartMiddlwares.cartOrlastOrder, getResponseMiddleware);

module.exports = router;