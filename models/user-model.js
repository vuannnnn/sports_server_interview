const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcrypt");

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true, // 保證email唯一
    match: [/^\S+@\S+\.\S+$/, "請輸入有效的email地址"], // 使用正則表達式驗證email格式
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 255,
  },
  role: {
    type: String,
    default: "user",
    enum: ["user", "admin"], //僅後台可見
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

userSchema.methods.isUser = function () {
  return this.role == "user";
};
userSchema.methods.isAdmin = function () {
  return this.role == "admin";
};

//驗證用戶輸入的密碼是否與數據庫中儲存的哈希密碼匹配
userSchema.methods.comparePassword = async function (password, cb) {
  let result;
  try {
    result = await bcrypt.compare(password, this.password); //(輸入密碼，哈希密碼)
    return cb(null, result);
  } catch (e) {
    return cb(e, result);
  }
};

//將密碼進行雜湊處理
//mongoose middleware(.pre)
userSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("password")) {
    const hashValue = await bcrypt.hash(this.password, 10);
    this.password = hashValue;
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
