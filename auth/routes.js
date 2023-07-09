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
} = require("./views/role");

router.post("/register", register);
router.post("/login", login);
router.get("/profile", auth, profile);
router.get("/privileges", privilegeList);
router.post("/privileges", auth, privilegeCreate);
router.put("/privileges/:id", auth, privilegeUpdate);
router.get("/privileges/:id", privilegeDetail);
router.get("/roles", rolesListing);
router.post("/roles", auth, roleCreate);
router.get("/roles/:id", roleDetail);
router.put("/roles/:id", auth, roleUpdate);
router.put("/roles/:id/privilege-add", auth, addRollPrivilege);

module.exports = router;
