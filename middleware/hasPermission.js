const Privilege = require("../auth/models/Privilege");

const hasPrivileges =
  (actions = []) =>
  async (req, res, next) => {
    // 1. Check if user is authenticated
    const user = req.user;
    if (!user) {
      return res
        .status(401)
        .json({ detail: "Access Denied. No token provided" });
    }

    // 2. Get privileges with requested actions
    const requiredPrivileges = await Privilege.find({
      action: { $in: actions },
    });

    // 3. Check if user has all the required privileges
    const privilegePromises = requiredPrivileges.map(({ _id }) =>
      user.hasPrivilege(_id)
    );

    const isPermitted = (await Promise.all(privilegePromises)).every(Boolean);

    if (!isPermitted) {
      return res.status(403).json({
        detail: "Forbidden. Insufficient permission to perform that action",
      });
    }

    next();
  };

module.exports = hasPrivileges;
