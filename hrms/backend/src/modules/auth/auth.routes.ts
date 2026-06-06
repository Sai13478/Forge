const express = require('express');
const router = express.Router();

router.post("/login", loginController);
router.post("/logout", logoutController);
router.get("/profile", getProfile);

module.exports = router;
