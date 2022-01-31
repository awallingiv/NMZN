const mongoose = require('mongoose');

const StoreSchema = new mongoose.Schema(
{
    name: String,
    price: Number
})

// a model is an instance of the schema ??
const StoreModel = mongoose.model('StoreItem', StoreSchema);

module.exports = StoreModel; 