const Joi = require("joi");

//註冊驗證
const registerValidation = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required().messages({
      "string.email": "請輸入有效的電子郵件地址",
      "any.required": "電子郵件是必填項",
    }),
    password: Joi.string().min(6).max(255).required(),
    role: Joi.string().valid("user", "admin").default("user"),
  });
  return schema.validate(data);
};

//登入驗證
const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(255).required(),
  });
  return schema.validate(data);
};

//體育項目驗證
const sportValidation = (data) => {
  const schema = Joi.object({
    sportName: Joi.string().required(),
  });
  return schema.validate(data);
};

//場館驗證
const venueValidation = (data) => {
  const schema = Joi.object({
    venueName: Joi.string().required(),
    address: Joi.string().required(),
  });
  return schema.validate(data);
};

//管理員->建立場館＋體育項目
const reservationValidation = (data) => {
  const schema = Joi.object({
    venueId: Joi.string().required().messages({ "any.required": "請選擇場館" }),
    sportId: Joi.string()
      .required()
      .messages({ "any.required": "請選擇運動項目" }),
    maxUser: Joi.number().min(1).required().messages({
      "number.min": "最多預約人數至少要有 1 人",
      "any.required": "請輸入最多預約人數",
    }),
    user: Joi.array().items(Joi.string().hex().length(24)),
  });
  return schema.validate(data);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.sportValidation = sportValidation;
module.exports.venueValidation = venueValidation;
module.exports.reservationValidation = reservationValidation;
