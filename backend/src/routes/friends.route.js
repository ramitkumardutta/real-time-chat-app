import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
    sendFriendRequest,
    acceptFriendRequest,
    getFriends,
    getPendingRequest,
    searchUsers,
} from "../controllers/friend.controller.js";

import { declineFriendRequest } from "../controllers/friend.controller.js";


const router = express.Router();

router.post("/decline/:userId", protectRoute, declineFriendRequest);
router.get("/search", protectRoute, searchUsers);
router.get("/", protectRoute, getFriends);
router.get("/requests", protectRoute, getPendingRequest);
router.post("/request/:userId", protectRoute, sendFriendRequest);
router.post("/accept/:userId", protectRoute, acceptFriendRequest)


export default router;