const router = require("express").Router();
const registerValidation = require("../validation").registerValidation;
const loginValidation = require("../validation").loginValidation;
const User = require("../models").user;
const jwt = require("jsonwebtoken");

const sendData = (message, state, data = {}) => {
  return {
    message,
    state,
    data,
  };
};

//獲得所有會員資訊
const getUser = async (req, res) => {
  try {
    const userFound = await User.find({}).exec();
    return res.send(sendData({}, "0", userFound));
  } catch (e) {
    console.log(e);
    return res.status(500).send(sendData(e, "1"));
  }
};

//註冊
const register = async (req, res) => {
  //確認數據是否符合規範(joi)
  const { error } = registerValidation(req.body);
  if (error) {
    return res.status(400).send(sendData(error.details[0].message, "1"));
  }
  //確認信箱是否被註冊過
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist)
    return res
      .status(400)
      .send(sendData("此信箱已被註冊，請使用登入系統...", "1"));
  //製作新用戶
  let { username, email, password, role } = req.body;
  const newUser = new User({ username, email, password, role });
  try {
    const saveUser = await newUser.save();
    return res.send(sendData("註冊成功！", "0", saveUser));
  } catch (e) {
    return res.status(500).send(sendData("註冊失敗...", "1"));
  }
};

//登入
const login = async (req, res) => {
  //確認數據是否符合規範(joi)
  const { error } = loginValidation(req.body);
  if (error)
    return res.status(400).send(sendData(error.details[0].message, "1"));
  //確認信箱是否有註冊過
  const foundUser = await User.findOne({ email: req.body.email });
  if (!foundUser) {
    return res
      .status(401)
      .send(sendData("無法找到使用者，請先確認信箱是否正確", "1"));
  }
  //密碼比對
  foundUser.comparePassword(req.body.password, (err, isMatch) => {
    if (err) return res.status(500).send(sendData(err, "1"));
    if (isMatch) {
      //製作jwt
      const tokenObject = { _id: foundUser._id, email: foundUser.email };
      const token = jwt.sign(tokenObject, process.env.PASSPORT_SECRET);
      return res.send({
        message: "登入成功！",
        state: "0",
        token: "JWT " + token,
        user: foundUser,
      });
    } else {
      return res.status(401).send(sendData("密碼錯誤，請重新輸入！", "1"));
    }
  });
};

module.exports = {
  getUser,
  register,
  login,
};
