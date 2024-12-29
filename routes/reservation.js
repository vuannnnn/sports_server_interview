const router = require("express").Router();
const reservationController = require("../controllers/reservationController");

router.use((req, res, next) => {
  console.log("reservation route正在接受一個request...");
  next();
});

//用reservationId、sportID、venueID獲得各項資訊，或直接搜尋所有資料
// 合併的 API
router.get("/reservations", reservationController.searchData);

//綁定(建立) 場館-運動項目(ok)
router.post("/", reservationController.addReservation);

//(前台)用userId尋找預約過的項目(ok)
router.get("/user/:_user_id", reservationController.searchReservation);

//(前台)讓user透過reservationId預約(ok)
router.post("/enroll/:_id", reservationController.enrollReservation);

//修改 場館-運動項目(ok)
router.patch("/:_id", reservationController.editReservation);

//刪除 場館-運動項目(ok)
router.delete("/:_id", reservationController.deletReservation);

module.exports = router;
