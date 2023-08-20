const {
  userValidator,
  loginValidator,
  privilegesValidator,
  changePaswordValidator,
  profileValidator,
} = require("../validators");
const {
  getValidationErrrJson,
  pickX,
  constructMongooseFilter,
  getUpdateFileAsync,
  constructFilter,
  constructSearch,
} = require("../../utils/helpers");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const { isEmpty, pick, merge } = require("lodash");
const { PROFILE_MEDIA } = require("../../utils/constants");
const Role = require("../models/Role");

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
        pick(user, [
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
        pick(users[0], [
          "_id",
          "username",
          "email",
          "phoneNumber",
          "isSuperUser",
          "firstName",
          "lastName",
          "roles",
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
    const errors = {};
    if (user.username !== value.username) {
      errors.username = { path: "username", message: "Invalid username" };
    }
    if (!(await bcrypt.compare(value.currentPassword, user.password))) {
      errors.currentPassword = {
        path: "currentPassword",
        message: "Invalid password",
      };
    }
    if (!isEmpty(errors)) {
      throw { errors };
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(value.newPassword, salt);
    user.password = hash;

    await user.save();
    return res
      .header("x-auth-token", user.generateAuthToken())
      .json(
        pickX(user, [
          "_id",
          "username",
          "email",
          "phoneNumber",
          "isSuperUser",
          "firstName",
          "lastName",
          "image",
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
    // for(true){
    //   if(user.roles.findIndex() === -1)
    // }
    return res.json(user);
  } catch (error) {
    const { error: err, status } = getValidationErrrJson(error);
    return res.status(status).json(err);
  }
};

const usersList = async (req, res) => {
  try {
    const search = req.query.search;
    const searchFields = [
      "_id",
      "username",
      "email",
      "firstName",
      "lastName",
      "phoneNumber",
      "isActive",
      "roles",
    ];
    const users = await User.aggregate([
      constructFilter(
        req.query,
        [
          "_id",
          "username",
          "email",
          "firstName",
          "lastName",
          "phoneNumber",
          "isActive",
          "roles",
        ],
        ["phoneNumber"]
      ),
      constructSearch(
        search,
        [
          "_id",
          "username",
          "email",
          "firstName",
          "lastName",
          "phoneNumber",
          "isActive",
          "roles",
        ],
        ["phoneNumber"]
      ),
    ]);
    return res.json({ results: users });
  } catch (error) {
    // const { error: err, status } = getValidationErrrJson(error);
    return res.json({ results: [] });
  }
};

const updateProfile = async (req, res) => {
  try {
    const values = await profileValidator({
      ...req.body,
      image: await getUpdateFileAsync(req, PROFILE_MEDIA, req.user.image),
    });

    let user = await User.findById(req.user._id);
    user = merge(user, values);
    await user.save();
    return res.json(
      pickX(user, [
        "_id",
        "username",
        "email",
        "phoneNumber",
        "isSuperUser",
        "firstName",
        "lastName",
        "image",
        "roles",
        "isSuperUser",
      ])
    );
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
  updateProfile,
  usersList,
};
