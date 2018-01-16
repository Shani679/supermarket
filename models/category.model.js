const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
	name: String,
	image: String,
	products: [{type: Schema.Types.ObjectId, ref: 'Product'}]
});

module.exports = categorySchema;
