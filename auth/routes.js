const { Router } = require("express");

const router = Router();
const auth = require("../middleware/auth");

const {
  register,
  login,
  profile,
  changePassword,
  updateProfile,
  usersList,
} = require("./views/authenticate");
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
  assignUserRoles,
  deleteUserRoles,
  menuOptionsList,
  menuOptionCreate,
  menuOptionUpdate,
  menuOptionDetail,
  addRollMenuOptions,
  deleteRollMenuOption,
  userMenuOptionsList,
  addUserRoles,
  userAuthInfo,
} = require("./views/role");
const hasPrivileges = require("../middleware/hasPermission");
const {
  patientActions,
  privilegeActions,
  roleActions,
  PROFILE_MEDIA,
  MENU_MEDIA,
} = require("../utils/constants");
const upload = require("../middleware/upload");
const {
  getAssociations,
  createAssociation,
  addCareReceiver,
  updateCareReceiver,
} = require("../patients/views/treatmentSurport");

router.post("/register", register);
router.post("/login", login);
router.post("/change-password", auth, changePassword);
router.get("/profile", auth, profile);
router.get("/users", auth, usersList);
router.get("/user/relations", auth, getAssociations);
router.post("/user/relations", auth, createAssociation);
router.post("/user/relations/add-care-receiver", auth, addCareReceiver);
router.put("/user/relations/:id/update-care-receiver", auth, updateCareReceiver);
router.get("/user/:id", auth, userAuthInfo);
router.post(
  "/profile",
  [auth, upload({ dest: PROFILE_MEDIA }).single("image")],
  updateProfile
);
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
router.put("/roles/:id/menu-add", auth, addRollMenuOptions);
router.delete("/roles/:id/privilege-delete", auth, deleteRollPrivilege);
router.delete("/roles/:id/menu-delete", auth, deleteRollMenuOption);
router.post("/user/:id/asign-role", [auth], assignUserRoles);
router.post("/user/:id/add-role", [auth], addUserRoles);
router.delete("/user/:id/delete-role", [auth], deleteUserRoles);
router.get("/menu-options", [auth], menuOptionsList);
router.get("/my-menu-options", [auth], userMenuOptionsList);
router.post(
  "/menu-options",
  [auth, upload({ dest: MENU_MEDIA }).single("image")],
  menuOptionCreate
);
router.get("/menu-options/:id", [auth], menuOptionDetail);
router.put(
  "/menu-options/:id",
  [auth, upload({ dest: MENU_MEDIA }).single("image")],
  menuOptionUpdate
);
module.exports = router;
