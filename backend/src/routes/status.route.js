import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createStatus, getFriendStatuses, getMyStatus } from "../controllers/status.controller.js";

const router = express.Router();

router.post("/", protectRoute, createStatus);
router.get("/friends", protectRoute, getFriendStatuses);
router.get("/me", protectRoute, getMyStatus);

export default router;
