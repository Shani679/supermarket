const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
	accessToken: String,
  refreshToken: String,
  profile: Object,
	firstName: String,
	lastName: String,
  username: String,
  password: String,
  city: String,
  street: String,
  role: {type: String, default: 'customer'},
  orders: [{type: Schema.Types.ObjectId, ref: 'Order'}]
});

module.exports = userSchema;
