const mongoose = require("mongoose");
const requestSchema = new mongoose.Schema(
  {
    _id: {
      type: Number,
      default: 0,
    },

    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
  },{ _id : false }
);

const Request = new mongoose.model("Request", requestSchema);

module.exports = Request;
