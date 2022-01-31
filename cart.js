const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema
(
{
    items: [{quantity: Number, item: {type: mongoose.ObjectId, ref: 'StoreItem'}}]
})

// a model is an instance of the schema ??
const CartModel = mongoose.model('Cart', CartSchema);

module.exports = CartModel; 