const { isEmpty } = require("lodash");
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

    // 3. Check if is a super Admin and give all privileges
    if (user.isSuperUser) return next();

    // 4. Get privileges with requested actions
    const requiredPrivileges = await Privilege.find({
      action: { $in: actions },
    });

    // 5. Check if no previleges then raise error
    if (isEmpty(requiredPrivileges))
      return res.status(403).json({
        detail: "Forbidden. Insufficient permission to perform that action",
      });
    // 6 . Check if user has all the required privileges
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
