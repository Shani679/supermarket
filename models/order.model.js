const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
	cart: {
		items: [{products: {type: Schema.Types.ObjectId, ref: 'Product'}, quantity: Number, total: Number}],
        createdOn: Date,
        totalPrice: Number,
    },
	city: String,
	street: String,
	shippingDate: String,
	orderDate: {type: Date, default: new Date()},
	creditCard: String
});

module.exports = orderSchema;

