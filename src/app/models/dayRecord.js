const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const dayRecord = new Schema({
        date: {type: String},
        weekday: {type: String},
        temp: {type: Number},
        hum: {type: Number},
        // soil: [{ type: Schema.Types.ObjectId, ref: 'Soil' }],
        soil: {type: Number},
        light: {type: Number}
    },
    {
        timestamps: false,
    }
);

module.exports = mongoose.model("dayRecord", dayRecord);
    