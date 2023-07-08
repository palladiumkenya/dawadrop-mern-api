const { Router } = require("express");
const {
  userValidator,
  loginValidator,
  privilegesValidator,
} = require("./validators");
const { getValidationErrrJson } = require("../utils/helpers");
const bcrypt = require("bcrypt");
const User = require("./models/User");
const router = Router();
const _ = require("lodash");
const auth = require("../middleware/auth");
const Privilege = require("./models/Privilege");

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
    return res
      .header("x-auth-token", user.generateAuthToken())
      .json(
        _.pick(user, [
          "_id",
          "username",
          "email",
          "phoneNumber",
          "isSuperUser",
          "firstName",
          "lastName",
        ])
      );
  } catch (error) {
    const { error: err, status } = getValidationErrrJson(error);
    return res.status(status).json(err);
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

    return res
      .header("x-auth-token", users[0].generateAuthToken())
      .json(
        _.pick(users[0], [
          "_id",
          "username",
          "email",
          "phoneNumber",
          "isSuperUser",
          "firstName",
          "lastName",
        ])
      );
  } catch (error) {
    const { error: err, status } = getValidationErrrJson(error);
    return res.status(status).json(err);
  }
});
router.get("/profile", auth, async (req, res) => {
  try {
    let user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ detail: "User not Found" });
    return res.json(user);
  } catch (error) {
    const { error: err, status } = getValidationErrrJson(error);
    return res.status(status).json(err);
  }
});
router.get("/privileges", async (req, res) => {
  const privileges = await Privilege.find();
  res.json({ results: privileges });
});
router.post("/privileges", auth, async (req, res) => {
  try {
    const value = await privilegesValidator(req.body);
    console.log(value);
    const privilege = new Privilege(value);
    await privilege.save();
    return res.json(privilege);
  } catch (ex) {
    const { error: err, status } = getValidationErrrJson(ex);
    return res.status(status).json(err);
  }
});
router.put("/privileges/:id", auth, async (req, res) => {
  try {
    const value = await privilegesValidator(req.body);
    const privilege = await Privilege.findById(req.params.id);
    if (!privilege) {
      throw new Error("Privilege not found");
    }
    privilege.name = value.name;
    privilege.description = value.description;
    await privilege.save();
    return res.json(privilege);
  } catch (ex) {
    const { error: err, status } = getValidationErrrJson(ex);
    return res.status(status).json(err);
  }
});
router.get("/privileges/:id", async (req, res) => {
  try {
    const privilege = await Privilege.findById(req.params.id);
    if (!privilege) {
      throw new Error("Privilege not found");
    }
    return res.json(privilege);
  } catch (ex) {
    const { error: err, status } = getValidationErrrJson(ex);
    return res.status(status).json(err);
  }
});

module.exports = router;
