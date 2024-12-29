const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const authRoute = require("./routes").auth;
const venueRoute = require("./routes").venue;
const sportRoute = require("./routes").sport;
const reservationRoute = require("./routes").reservation;
const cors = require("cors");
const passport = require("passport");
require("./config/passport")(passport);

//連接mongoDB
mongoose
  .connect(
    "mongodb+srv://vuannnnn:<password>@vuannnnn.x9dku.mongodb.net/sportDB"
  )
  .then(() => {
    console.log("connecting in mongoDB...");
  })
  .catch((e) => {
    console.log("Error connecting to MongoDB:", e);
  });

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/api/user", authRoute);

app.get("/test", (req, res) => {
  res.json({
    message: "test work!!",
  });
});

//venue route應該要被jwt保護，只有登入的人才能預約
//如果request header內部沒有jwt，則request就會被視為是unauthorized
app.use(
  "/api/venue",
  passport.authenticate("jwt", { session: false }),
  venueRoute
);

app.use(
  "/api/sport",
  passport.authenticate("jwt", { session: false }),
  sportRoute
);

app.use(
  "/api/reservation",
  passport.authenticate("jwt", { session: false }),
  reservationRoute
);

app.listen(1004, () => {
  console.log("後端伺服器正在聆聽port 1004...");
});

// 部署到Vercel
// export default app;
