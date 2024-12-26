const router = require("express").Router();
const sportController = require("../controllers/sportController");

router.use((req, res, next) => {
  console.log("sport route正在接受一個request...");
  next();
});

//獲得所有運動項目資訊
router.get("/", sportController.getSport);

//新增運動項目
router.get("/", sportController.addSport);

//修改運動項目資訊
router.patch("/:_id", sportController.editSport);

//刪除運動項目資料
router.patch("/:_id", sportController.deletSport);

module.exports = router;
