const mongoose = require("mongoose");
const { Schema } = mongoose;
const Venue = require("./venue-model");
const Sport = require("./sport-model");
// const { venue } = require(".");

const reservationSchema = new Schema({
  id: {
    type: String,
  },
  venueId: {
    type: String,
    ref: "Venue",
    required: [true, "請選擇場館"],
  },
  sportId: {
    type: String,
    ref: "Sport",
    required: [true, "請選擇運動項目"],
  },
  maxUser: {
    type: Number,
    required: [true, "請輸入最多預約人數"],
  },
  user: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

module.exports = mongoose.model("Reservation", reservationSchema);
