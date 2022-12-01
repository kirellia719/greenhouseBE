const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Notification = new Schema(
  {
    time: { type: Date },
    message: { type: String },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", Notification);
