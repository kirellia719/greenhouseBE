const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Soil = new Schema({
    name: {type: String,maxLength: 255},
    humi: {Number},
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Soil", Soil);