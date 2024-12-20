const router = require("express").Router();
const Venue = require("../models").venue;
const venueValidation = require("../validation").venueValidation;

router.use((req, res, next) => {
  console.log("venue route正在接受一個request...");
  next();
});

const sendData = (message, state, data = {}) => {
  return {
    message,
    state,
    data,
  };
};

//獲得所有場館資訊
router.get("/", async (req, res) => {
  try {
    let venueFound = await Venue.find({}).exec();
    return res.send(sendData({}, "0", venueFound));
  } catch (e) {
    return res.status(500).send(sendData(e, "1"));
  }
});

//新增場館
router.post("/", async (req, res) => {
  //驗證數據符合規範
  let { error } = venueValidation(req.body);
  if (error)
    return res
      .status(400)
      .send(sendData(error.details[0].message || "驗證失敗", "1"));
  //身份驗證
  if (req.user.isUser()) {
    return res
      .status(403)
      .send(sendData("只有管理員帳號可以新增場館，請由管理員帳號登入！", "1"));
  }
  //新增
  let { venueName, address } = req.body;
  try {
    let newVenue = new Venue({ venueName, address });
    let saveVenue = await newVenue.save();
    return res.send(sendData("新場館已保存！", "0", saveVenue));
  } catch (e) {
    console.log(e);
    return res.status(500).send(sendData("無法新增場館...", "1"));
  }
});

//修改場館資訊
router.patch("/:_id", async (req, res) => {
  //驗證數據符合規範
  let { error } = venueValidation(req.body);
  if (error)
    return res
      .status(400)
      .send(sendData(error.details[0].message || "驗證失敗", "1"));

  let { _id } = req.params;
  try {
    //確認場館存在
    let venueFound = await Venue.findOne({ _id }).exec();
    if (!venueFound) {
      return res.status(400).send(sendData("場館不存在，無法修改內容...", "1"));
    }
    //身份驗證
    if (req.user.isAdmin()) {
      let updateVenue = await Venue.findOneAndUpdate({ _id }, req.body, {
        new: true,
        runValidators: true,
      });
      return res.send(sendData("場館更新成功！", "0", updateVenue));
    } else {
      return res
        .status(403)
        .send(sendData("只有管理員才能修改場館資訊...", "1"));
    }
  } catch (e) {
    return res.status(500).send(sendData(e, "1"));
  }
});

//刪除場館資料
router.delete("/:_id", async (req, res) => {
  let { _id } = req.params;
  try {
    //確認場館存在
    let venueFound = await Venue.findOne({ _id }).exec();
    if (!venueFound)
      return res.status(400).send(sendData("無此場館，無法刪除...", "1"));
    //身份驗證
    if (req.user.isAdmin()) {
      await Venue.deleteOne({ _id }).exec();
      return res.send(sendData("場館已被刪除", "0"));
    } else {
      return res
        .status(403)
        .send(sendData("只有管理員身份才能刪除場館...", "1"));
    }
  } catch (e) {
    return res.status(500).send(sendData(e, "1"));
  }
});

module.exports = router;
