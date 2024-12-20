const mongoose = require("mongoose");
// const { validate } = require("./user-model");
const { Schema } = mongoose;

const sportSchema = new Schema({
  id: {
    type: String,
  },
  sportName: {
    type: String,
    required: [true, "請輸入運動項目名稱"],
  },
});

module.exports = mongoose.model("Sport", sportSchema);
