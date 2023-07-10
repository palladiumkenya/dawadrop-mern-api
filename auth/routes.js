const { Router } = require("express");

const router = Router();
const auth = require("../middleware/auth");

const { register, login, profile } = require("./views/authenticate");
const {
  privilegeList,
  privilegeCreate,
  privilegeUpdate,
  privilegeDetail,
} = require("./views/privilege");
const {
  rolesListing,
  roleDetail,
  roleUpdate,
  roleCreate,
  addRollPrivilege,
  deleteRollPrivilege,
} = require("./views/role");
const hasPrivileges = require("../middleware/hasPermission");
const {
  patientActions,
  privilegeActions,
  roleActions,
} = require("../utils/constants");

router.post("/register", register);
router.post("/login", login);
router.get("/profile", auth, profile);
router.get("/privileges", privilegeList);
router.post(
  "/privileges",
  [auth, hasPrivileges(privilegeActions.create)],
  privilegeCreate
);
router.put(
  "/privileges/:id",
  [auth, hasPrivileges(privilegeActions.update)],
  privilegeUpdate
);
router.get("/privileges/:id", privilegeDetail);
router.get("/roles", rolesListing);
router.post("/roles", [auth, hasPrivileges(roleActions.create)], roleCreate);
router.get("/roles/:id", roleDetail);
router.put("/roles/:id", [auth, hasPrivileges(roleActions.update)], roleUpdate);
router.put("/roles/:id/privilege-add", auth, addRollPrivilege);
router.delete("/roles/:id/privilege-delete", auth, deleteRollPrivilege);

module.exports = router;
