const mongoose = require("mongoose");
const googleschema = new mongoose.Schema(
  {
    username: {
      type: String,
      require: false,
    },
    email: {
      type: String,
      unique: true,
    },
    imageurl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Googemodel = mongoose.model("googleschema", googleschema);
module.exports = Googemodel;
