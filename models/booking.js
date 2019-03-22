var mongoose = require("mongoose");

var bookingSchema = mongoose.Schema({
    title: String,
    booker: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String,
        
    },
    date: {type: Date, default: Date.now},
    price: Number,
    bookid: String,
    mrp: Number,
    qty: Number
});

module.exports = mongoose.model("Booking",bookingSchema);