var mongoose = require("mongoose");

var eventSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String,
    longDescription: String, 
    duration: String,
    rating: String,
    price: String

});

module.exports = mongoose.model("Event",eventSchema);