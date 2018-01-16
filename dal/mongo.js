const mongoose = require('mongoose');
const async = require('async');
const ProductSchema = require('../models/product.model');
const Product = mongoose.model('Product', ProductSchema);
const CategorySchema= require('../models/category.model');
const Category = mongoose.model('Category', CategorySchema);
const UserSchema = require('../models/user.model');
const User = mongoose.model('User', UserSchema);
const OrderSchema = require('../models/order.model');
const Order = mongoose.model('Order', OrderSchema);
const responseHandlers = require('../handlers/response-handlers');

const queries = {
  fetchAllOrders: (req, res, next) => {
    Order.find().count().exec((err, data) => responseHandlers.errorHandler(err, res, () => {
      req.orders = data;
      next();
    }));
  },

  fetchAllProducts: (req, res, next) => {
    Product.find().count().exec((err, data) => responseHandlers.errorHandler(err, res, () => {
      req.products = data;
      next();
    }));
  },

  fetchProductsByCategory: (req, res, next) => {
    const _id = req.params.id;
    Category.find({_id}).populate('products').exec((err, data) => responseHandlers.errorHandler(err, res, () => responseHandlers.successHandler(req, data[0].products, next)));
  },

  fetchProductsByName: (req, res, next) => {
    Product.find({name: {'$regex': req.params.name}}).exec((err, data) => responseHandlers.errorHandler(err, res, () => responseHandlers.successHandler(req, data, next)));
  },

  fetchProductById: (req, res, next) => {
    const _id = req.body.id;
    Product.find({_id}, (err, data) => responseHandlers.errorHandler(err, res, () => responseHandlers.successHandler(req, data[0], next)));
  },

  makeOrder: (req, res, next) => {
    const {city, street, shippingDate, creditCard} = req.body;
    const newOrder = new Order({city, street, shippingDate, creditCard, cart: req.session.cart});
    newOrder.save((err, data) => responseHandlers.errorHandler(err, res, () => queries.appendOrderToUser(req, res, data, next)));
  },

  appendOrderToUser: (req, res, data, next) => {
    const _id = req.session.passport.user.user ? req.session.passport.user.user._id : req.session.passport.user._id;
    User.update({_id}, {$push: {"orders": data}}, {safe: true, upsert: true}, (err, data2) => responseHandlers.errorHandler(err, res, () => responseHandlers.successHandler(req, data2, next)));
  },

  createCategory: (req, res, next) => {
    const newCategory = new Category(req.body);
    newCategory.save((err, data) => responseHandlers.errorHandler(err, res, () => responseHandlers.successHandler(req, data, next)));
  },

  fetchAllUserOrders: (req, res, next) => {
     User.find({_id: req.session.passport.user._id}).populate("orders").exec((err, data) => responseHandlers.errorHandler(err, res, () => responseHandlers.successHandler(req, data[0].orders, next)));
  },

  createNewProduct: (req, res, next) => {
    const newProduct = new Product(req.body);
    newProduct.save((err, data) => responseHandlers.errorHandler(err, res, () => queries.appendProductToCategory(req, res, data, next)));
  },

  appendProductToCategory: (req, res, data, next) => {
    const _id = req.body.cid;
    Category.update({_id}, {$push: {"products": data}}, {safe: true, upsert: true}, (err, data) => responseHandlers.errorHandler(err, res, () => responseHandlers.successHandler(req, data, next)));
  },

  updateProduct: (req, res, next) => {
    const {_id, name, price, image} =  req.body;
    image ? Product.update({_id}, {name, price, image}, (err, data) => responseHandlers.errorHandler(err, res, () => responseHandlers.successHandler(req, data, next))) : Product.update({_id}, {name, price}, (err, data) => responseHandlers.errorHandler(err, res, () => responseHandlers.successHandler(req, data, next)))
  },

  fetchAllCategories: (req, res, next) => {
    Category.find().exec((err, data) => responseHandlers.errorHandler(err, res, () => responseHandlers.successHandler(req, data, next)));
  },

  fetchDeliveryDates: (req, res, next) => {
      Order.aggregate( {$group: {_id: '$shippingDate', count: {$sum: 1}}}).exec((err, data)=> responseHandlers.errorHandler(err, res, () => responseHandlers.successHandler(req, data, next)));
  }, 

  deleteProduct: (req, res, next) =>{
    const _id = req.params.pid;
    Category.remove({_id}, (err, data) => responseHandlers.errorHandler(err, res, () => queries.removeFromCtg(req, res, data, next)));
  },

  removeFromCtg: (req, res, data, next) => {
    const {pid, cid} = req.params;
    Category.update({_id: cid}, { $pull: { products: pid }}, (err, data) => responseHandlers.errorHandler(err, res, () => responseHandlers.successHandler(req, data, next)))
  },

  userExist: (req, res, next) => {
    const username = req.params.username.toLowerCase();
    User.findOne({username}, (err, data) => responseHandlers.errorHandler(err, res, () => {
      data = data ? true : false 
      responseHandlers.successHandler(req, data, next);
    }));
  },
}

module.exports = queries;
