const { compare } = require("bcrypt");
const router = require("express").Router();
const Reservation = require("../models").reservation;
const reservationValidation = require("../validation").reservationValidation;

const sendData = (message, state, data = {}) => {
  return {
    message,
    state,
    data,
  };
};

//用reservationId、sportID、venueID獲得各項資訊，或直接搜尋所有資料
// 合併的 API
const searchData = async (req, res) => {
  const { _id, sportId, venueId } = req.query;

  // 構建查詢條件
  const query = {};

  if (_id) {
    query._id = _id;
  }
  if (sportId) {
    query.sportId = sportId;
  }
  if (venueId) {
    query.venueId = venueId;
  }

  try {
    // 根據是否有查詢條件(id)決定查詢所有或根據條件查詢
    let reservationFound;
    if (Object.keys(query).length > 0) {
      reservationFound = await Reservation.find(query)
        .populate("sportId", "sportName")
        .populate("venueId", "venueName")
        .exec();
    } else {
      reservationFound = await Reservation.find({})
        .populate("sportId", "sportName")
        .populate("venueId", "venueName")
        .exec();
    }
    return res.send(sendData({}, "0", reservationFound));
  } catch (e) {
    return res.status(500).send(sendData(e, "1"));
  }
};

//綁定(建立) 場館-運動項目(ok)
const addReservation = async (req, res) => {
  console.log(req.body);

  //驗證數據符合規範(Joi)
  const { error } = reservationValidation(req.body);
  if (error)
    return res.status(400).send(sendData(error.details[0].message, "1"));
  //身份驗證
  if (!req.user.isAdmin()) {
    return res
      .status(403)
      .send(
        sendData("只有管理員帳號可以新增場館項目，請由管理員帳號登入！", "1")
      );
  }
  //新增場館及運動項目
  const { venueId, sportId, maxUser } = req.body;
  try {
    const newResveration = new Reservation({ venueId, sportId, maxUser });
    const saveReservation = await newResveration.save();
    return res.send(sendData("場館及運動項目已綁定！", "0", saveReservation));
  } catch (e) {
    console.log(e);
    return res.status(500).send(sendData("無法綁定場館及運動項目...", "1"));
  }
};

//(前台)用userId尋找預約過的項目(ok)
const searchReservation = async (req, res) => {
  const { _user_id } = req.params;
  // console.log(req.params);
  const reservationFound = await Reservation.find({ user: _user_id }).exec();
  return res.send(sendData({}, "0", reservationFound));
};

//(前台)讓user透過reservationId預約(ok)
const enrollReservation = async (req, res) => {
  const { _id } = req.params;
  try {
    const reservation = await Reservation.findOne({ _id }).exec();
    //檢查人數是否到達maxUser
    if (reservation.user.length >= reservation.maxUser) {
      return res.status(400).send(sendData("預約已滿，無法再預約", "1"));
    }
    //新增user
    reservation.user.push(req.user._id);
    await reservation.save();
    return res.send(sendData("預約完成", "0"));
  } catch (e) {
    console.log(e);
    return res.status(500).send(sendData("預約失敗", "1"));
  }
};

//修改 場館-運動項目(ok)
const editReservation = async (req, res) => {
  //驗證數據符合規範(Joi)
  const { error } = reservationValidation(req.body);
  if (error)
    return res.status(400).send(sendData(error.details[0].message, "1"));

  const { _id } = req.params;
  try {
    //確認存在
    const reservationFound = await Reservation.findOne({ _id }).exec();
    if (!reservationFound) {
      return res.status(400).send(sendData("項目不存在，無法修改內容...", "1"));
    }
    //身份驗證
    if (req.user.isAdmin()) {
      const updateReservation = await Reservation.findOneAndUpdate(
        { _id },
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );
      return res.send(sendData("場館及項目更新成功！", "0", updateReservation));
    } else {
      return res
        .status(403)
        .send(sendData("只有管理員才能修改場館及項目資訊...", "1"));
    }
  } catch (e) {
    return res.status(500).send(sendData(e, "1"));
  }
};

//刪除 場館-運動項目(ok)
const deletReservation = async (req, res) => {
  const { _id } = req.params;
  try {
    //確認場館存在
    const reservationFound = await Reservation.findOne({ _id }).exec();
    if (!reservationFound)
      return res.status(400).send(sendData("無此場館及項目，無法刪除...", "1"));
    //身份驗證
    if (req.user.isAdmin()) {
      await Reservation.deleteOne({ _id }).exec();
      return res.send(sendData("場館及項目已被刪除", "0"));
    } else {
      return res
        .status(403)
        .send(sendData("只有管理員身份才能刪除場館及項目...", "1"));
    }
  } catch (e) {
    return res.status(500).send(sendData(e, "1"));
  }
};

module.exports = {
  searchData,
  addReservation,
  searchReservation,
  enrollReservation,
  editReservation,
  deletReservation,
};
