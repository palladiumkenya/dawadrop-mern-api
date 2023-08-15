const { isEmpty } = require("lodash");
const Privilege = require("../auth/models/Privilege");

const hasPermision = async (req, actions = []) => {
  // 1. Check if user is authenticated
  const user = req.user;
  if (!user) {
    return false;
  }

  // 3. Check if is a super Admin and return true
  if (user.isSuperUser) return true;

  // 4. Get privileges with requested actions
  const requiredPrivileges = await Privilege.find({
    action: { $in: actions },
  });

  // 5. Check if no previleges then raise error
  if (isEmpty(requiredPrivileges)) return false;
  // 6 . Check if user has all the required privileges
  const privilegePromises = requiredPrivileges.map(({ _id }) =>
    user.hasPrivilege(_id)
  );

  const isPermitted = (await Promise.all(privilegePromises)).every(Boolean);

  if (!isPermitted) {
    return false;
  }
  return true;
};

module.exports = hasPermision;
