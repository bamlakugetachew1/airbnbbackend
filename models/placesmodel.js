const mongoose = require("mongoose");
const placeSchema = new mongoose.Schema(
  {
    ownerid: {
      require: true,
      type: String,
    },
    title: {
      require: true,
      type: String,
    },
    Address: {
      require: true,
      type: String,
    },
    photos: {
      require: true,
      type: Array,
      default: [],
    },
    description: {
      require: true,
      type: String,
    },
    perks: {
      require: true,
      type: Array,
      default: [],
    },
    extrainfo: {
      require: true,
      type: String,
    },
    checkin: {
      require: true,
      type: String,
    },
    checkout: {
      require: true,
      type: String,
    },
    maxGuests: {
      require: true,
      type: Number,
    },
    price: {
      require: true,
      type: Number,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Place = mongoose.model("Place", placeSchema);
module.exports = Place;
