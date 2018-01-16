const mongoose = require('mongoose');
const UserSchema = require('../models/user.model');
const User = mongoose.model('User', UserSchema);
const OrderSchema = require('../models/order.model');
const Order = mongoose.model('Order', OrderSchema);
const responseHandlers = require('../handlers/response-handlers');



	const cartOrlastOrder = (req, res, next) => {
		if(req.session.cart){
      return next();
    }
    const _id = req.session.passport.user.user ? req.session.passport.user.user._id : req.session.passport.user._id;
    User.findOne({_id}).populate('orders').exec((err, data) => responseHandlers.errorHandler(err, res, () => responseHandlers.successHandler(req, data.orders[data.orders.length-1], next)));
	}

  const updateCart = (req, res, next) => {
    if(!req.session.cart){
      return createCart(req, next);
    }
    return findInCart(req.session.cart.items, req.body, (index, foundProduct) => {
      index != -1 ? updateProduct(req, foundProduct, index, next) : appendProductToCart(req.session.cart.items, req.body, next);
    });
  }

  const findInCart = (cartProducts, newProduct, callback) => {
    for (let i = 0; i < cartProducts.length; i++) {
      if(cartProducts[i].products._id === newProduct.products._id){
        return callback(i, cartProducts[i]);
      }
    }
    return callback(-1);
  }

  const updateProduct = (req, product, i, next) => {
    const newQuantity = req.body.quantity;
    if(product.quantity === 1 && newQuantity === -1){
      req.session.cart.items.splice(i, 1);
      if(req.session.cart.items.length === 0){
          delete req.session.cart;
      }
      return next();
    }
    product.quantity += Number(newQuantity);
    product.total = product.quantity * Number(req.body.products.price);
    next();
  }

  const appendProductToCart = (cartProducts, newProduct, next) => {
    newProduct.total = Number(newProduct.quantity) * Number(newProduct.products.price);
    cartProducts.push(newProduct);
    return next();
  }

  const createCart = (req, next) => {
    req.body.total = Number(req.body.quantity) * Number(req.body.products.price);
    req.session.cart = {
      items: [req.body],
      createdOn: new Date()
    }
    return next();
  }

  const calTotalPrice = (req, res, next) => {
    if(req.session.cart){
      const productsArray = req.session.cart.items;
      let totalPrice = 0;
      productsArray.forEach(current => {
        totalPrice += current.total;
      })
      req.session.cart.totalPrice = totalPrice;
      req.data = req.session.cart;
      return next();
    }
    return next();
  }

  const removeProductFromCart = (req, res, next) => {
    const products = req.session.cart.items;
    products.forEach((current, i) => {
      if(current.products._id === req.params.id){
        products.splice(i, 1);
        if(products.length === 0){
          delete req.session.cart;
          return next();
        }
        req.data = req.session.cart;
        return next();
      }
    })
  }

  const destroyCart = (req, res, next) => {
    delete req.session.cart;
    return next();
  }


module.exports = {
    cartOrlastOrder,
    updateCart,
    calTotalPrice,
    removeProductFromCart,
    destroyCart
}