const router = require("express").Router();
const venueController = require("../controllers/venueController");

router.use((req, res, next) => {
  console.log("venue route正在接受一個request...");
  next();
});

//獲得所有場館資訊
router.get("/", venueController.getVenue);

//新增場館
router.get("/", venueController.addVenue);

//修改場館資訊
router.patch("/:_id", venueController.editVenue);

//刪除場館資料
router.patch("/:_id", venueController.deletVenue);

module.exports = router;
