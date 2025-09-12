const express = require("express");
const router = express.Router();
const memberController = require("../controllers/Team/memberController");
const { verifyToken, isAuthenticated } = require("../middlewares/authMiddleware");
const { teamUpload } = require("../config/cloudinary");

// import từ Google Sheet
router.post("/google-sheet", verifyToken, isAuthenticated, memberController.importFromGoogleSheet);
router.post("/", verifyToken, isAuthenticated, teamUpload.single("avatar"), memberController.create);
router.put("/:memberId", verifyToken, isAuthenticated, teamUpload.single("avatar"), memberController.update);
router.delete("/:memberId", verifyToken, isAuthenticated, memberController.delete);
router.get("/team/:teamId", verifyToken, isAuthenticated, memberController.getByteamId);
router.get("/:memberId", verifyToken, isAuthenticated, memberController.getById);
router.get("/", verifyToken, isAuthenticated, memberController.getAll);



module.exports = router;
