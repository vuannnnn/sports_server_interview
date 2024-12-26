const router = require("express").Router();
const Sport = require("../models").sport;
const sportValidation = require("../validation").sportValidation;

const sendData = (message, state, data = {}) => {
  return {
    message,
    state,
    data,
  };
};

//獲得所有運動項目資訊
const getSport = async (req, res) => {
  try {
    const sportFound = await Sport.find({}).exec();
    return res.send(sendData({}, "0", sportFound));
  } catch (e) {
    return res.status(500).send(sendData(e, "1"));
  }
};

//新增運動項目
const addSport = async (req, res) => {
  //驗證數據符合規範
  const { error } = sportValidation(req.body);
  if (error)
    return res
      .status(400)
      .send(sendData(error.details[0].message || "驗證失敗", "1"));
  //身份驗證
  if (req.user.isUser()) {
    return res
      .status(403)
      .send(
        sendData("只有管理員帳號可以新增運動項目，請由管理員帳號登入！", "1")
      );
  }
  //新增
  let { sportName, address } = req.body;
  try {
    const newSport = new Sport({ sportName });
    const saveSport = await newSport.save();
    return res.send(sendData("新運動項目已保存！", "0", saveSport));
  } catch (e) {
    console.log(e);
    return res.status(500).send(sendData("無法新增運動項目...", "1"));
  }
};

//修改運動項目資訊
const editSport = async (req, res) => {
  //驗證數據符合規範
  const { error } = sportValidation(req.body);
  if (error)
    return res
      .status(400)
      .send(sendData(error.details[0].message || "驗證失敗", "1"));

  const { _id } = req.params;
  try {
    //確認運動項目存在
    const sportFound = await Sport.findOne({ _id }).exec();
    if (!sportFound) {
      return res
        .status(400)
        .send(sendData("運動項目不存在，無法修改內容...", "1"));
    }
    //身份驗證
    if (req.user.isAdmin()) {
      const updateSport = await Sport.findOneAndUpdate({ _id }, req.body, {
        new: true,
        runValidators: true,
      });
      return res.send(sendData("運動項目更新成功！", "0", updateSport));
    } else {
      return res
        .status(403)
        .send(sendData("只有管理員才能修改運動項目資訊...", "1"));
    }
  } catch (e) {
    return res.status(500).send(sendData(e, "1"));
  }
};

//刪除運動項目資料
const deletSport = async (req, res) => {
  const { _id } = req.params;
  try {
    //確認運動項目存在
    const sportFound = await Sport.findOne({ _id }).exec();
    if (!sportFound)
      return res.status(400).send(sendData("無此運動項目，無法刪除...", "1"));
    //身份驗證
    if (req.user.isAdmin()) {
      await Sport.deleteOne({ _id }).exec();
      return res.send(sendData("運動項目已被刪除", "0"));
    } else {
      return res
        .status(403)
        .send(sendData("只有管理員身份才能刪除運動項目...", "1"));
    }
  } catch (e) {
    return res.status(500).send(sendData(e, "1"));
  }
};

module.exports = {
  getSport,
  addSport,
  editSport,
  deletSport,
};
