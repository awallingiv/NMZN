const mongoose = require('mongoose');
const Cart = require('./cart');

const User = new mongoose.model('User', new mongoose.Schema({
    firstName: String,
    lastName: String,
    login: String,
    password: String,
    email: String,
    cart: [{type: mongoose.ObjectId, ref: 'Cart'}]
}))


module.exports = User; //export this to use in other js file 