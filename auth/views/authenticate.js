const {
  userValidator,
  loginValidator,
  privilegesValidator,
  changePaswordValidator,
} = require("../validators");
const { getValidationErrrJson } = require("../../utils/helpers");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const _ = require("lodash");

const register = async (req, res) => {
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
};

const login = async (req, res) => {
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
};
const changePassword = async (req, res) => {
  // let user = User.findOne({email})
  try {
    const value = await changePaswordValidator(req.body);
    const user = await User.findOne({ _id: req.user._id });
    if (
      user.username !== value.username ||
      !(await bcrypt.compare(value.newPassword, user.password))
    ) {
      console.log(user);
      return res.status(400).json({ detail: "Invalid Username or password" });
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(value.newPassword, salt);
    user.password = hash;
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
};

const profile = async (req, res) => {
  try {
    const user = req.user;
    return res.json(user);
  } catch (error) {
    const { error: err, status } = getValidationErrrJson(error);
    return res.status(status).json(err);
  }
};

module.exports = {
  register,
  login,
  profile,
  changePassword,
};
