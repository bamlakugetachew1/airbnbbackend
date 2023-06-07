const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  ownerid: {
    type: String,
    required: true,
  },
  placeid: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  checkin: {
    type: String,
    required: true,
  },
  checkout: {
    type: String,
    required: true,
  },
});
const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
