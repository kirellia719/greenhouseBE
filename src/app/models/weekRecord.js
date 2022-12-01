const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const weekRecord = new Schema(
  {
    startday: {type: String},
    daydatas:[{ type: Schema.Types.ObjectId, ref: 'dayRecord' }]
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("weekRecord", weekRecord);
