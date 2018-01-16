const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
	name: String,
  	price: Number,
  	image: String
});

module.exports = productSchema;