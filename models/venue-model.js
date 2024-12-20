const mongoose = require("mongoose");
const { Schema } = mongoose;

const venueSchema = new Schema({
  id: {
    type: String,
  },
  venueName: {
    type: String,
    required: [true, "請輸入場館名稱"],
  },
  address: {
    type: String,
    required: [true, "請輸入場館地址"],
  },
});

module.exports = mongoose.model("Venue", venueSchema);
