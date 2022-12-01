const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require("./user");

const PhysicalDevice = new Schema(
  {
    name: { type: String, maxLength: 255 , unique: true},
    status: { type: Boolean },
    usetimes: { type: Number },
    history: [
      {
        time: { type: Date },
        status: { type: Boolean },
        username: { type: String, ref: "User" },
      },{
        _id: false
      }
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PhysicalDevice", PhysicalDevice);
