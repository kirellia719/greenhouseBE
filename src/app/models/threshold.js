const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Threshold = new Schema({
    type: { type: String},
    min: { type: Number},
    max: { type: Number},
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Threshold", Threshold);