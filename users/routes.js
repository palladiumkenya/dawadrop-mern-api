const { Router } = require("express");
const { userValidator, loginValidator } = require("./validators");
const { getValidationErrrJson } = require("../utils/helpers");
const bcrypt = require("bcrypt");
const User = require("./models/User");
const router = Router();

router.post("/register", async (req, res) => {
  // let user = User.findOne({email})
  try {
    const value = await userValidator(req.body);
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(value.password, salt);
    delete value.confirmPassword;
    value.password = hash;
    const user = new User(value);
    await user.save();
    return res.json(user);
  } catch (error) {
    return res.status(400).json(getValidationErrrJson(error));
  }
});
router.post("/login", async (req, res) => {
  // let user = User.findOne({email})
  try {
    const value = await loginValidator(req.body);
    let users = await User.find().or([
      { username: value.username },
      { email: value.username },
    ]);
    if (users.length === 0) {
      return res.status(400).json({ detail: "Invalid Username or password" });
    }
    const valid = await bcrypt.compare(value.password, users[0].password);
    if (!valid) {
      return res.status(400).json({ detail: "Invalid Username or password" });
    }
    return res.json({ user: users[0], token: "" });
  } catch (error) {
    return res.status(400).json(getValidationErrrJson(error));
  }
});

module.exports = router;
