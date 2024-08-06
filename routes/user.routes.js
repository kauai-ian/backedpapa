// user routes

const users = require("../controllers/users.controller");
const router = require("express").Router();
const { checkJwt } = require("../middleware/auth.middleware");

router.get("/", users.listUsers);
router.post("/", users.createUser);
router.get("/:sub", checkJwt, users.getUserById);
router.put("/:sub", checkJwt, users.updateUser);
router.delete("/:sub", checkJwt, users.deleteUser);

module.exports = router;