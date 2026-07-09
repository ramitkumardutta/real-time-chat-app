import User from "../models/user.model.js";
import {getReceiverSocketId, io} from "../lib/socket.js";
import mongoose from "mongoose";

export const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        const myId = req.user._id;

        if (!query) return res.status(400).json({ message: "Query is required" });

        const me = await User.findById(myId).lean();

        const myFriends = me.friends || [];
        const myRequests = me.friendRequests || [];
        const myIdStr = String(myId);

        const users = await User.find({
            fullName: { $regex: query, $options: "i" },
            _id: { $ne: myId },
        })
        .select("_id fullName profilePic friendRequests")
        .lean();

        const enriched = users.map((user) => {
            const userIdStr = String(user._id);

            const isFriend = myFriends.some(
                (friendId) => String(friendId) === userIdStr
            );

            const isPending = myRequests.some(
                (r) => String(r.from) === userIdStr && r.status === "pending"
            );

            const theirRequests = user.friendRequests || [];
            const iSentRequest = theirRequests.some(
                (r) => String(r.from) === myIdStr && r.status === "pending"
            );

            return {
                _id: user._id,
                fullName: user.fullName,
                profilePic: user.profilePic,
                isFriend,
                isPending,
                iSentRequest,
            };
        });

        res.status(200).json(enriched);
    } catch (error) {
        console.log("Error in searchUsers:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const sendFriendRequest = async (req, res) => {
    try {
        const { userId } = req.params;
        const myId = req.user._id;

        // Validate supplied userId is a valid ObjectId
        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({ message: "Invalid user id" });
        }

        if (String(userId) === String(myId)) {
            return res.status(400).json({ message: "Cannot send request to yourself"});
        }

        const targetUser = await User.findById(userId);

        if(!targetUser) return res.status(404).json({ message: "User not found" });

        //* Already friends
        if((targetUser.friends || []).map(String).includes(String(myId))) {
            return res.status(400).json({ message: "Already friends" });
        }

        const alreadySent = (targetUser.friendRequests || []).some(
            (r) => String(r.from) === String(myId)
        );

        if(alreadySent) {
            return res.status(400).json({ message: "Request Already Sent" });
        }

        targetUser.friendRequests = targetUser.friendRequests || [];
        targetUser.friendRequests.push({ from: myId, status: "pending" });

        await targetUser.save();

        const targetSocketId = getReceiverSocketId(userId);

        if(targetSocketId) {
            const me = await User.findById(myId).select("_id fullName profilePic");
            io.to(targetSocketId).emit("newFriendRequest", { from: me });
        }

        res.status(200).json({ message: "Friend request sent" });

    } catch (error) {
        console.log("Error in SendFriendRequest:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const acceptFriendRequest = async (req, res) => {
    try {
        const { userId } = req.params;
        const myId = req.user._id;

        const me = await User.findById(myId);
        const them = await User.findById(userId);

        if(!them) return res.status(404).json({ message: "User not found" });

        // ensure friendRequests exists
        me.friendRequests = me.friendRequests || [];
        const requestIndex = me.friendRequests.findIndex(
            (r) => String(r.from) === String(userId) && r.status === "pending"
        );

        if (requestIndex === -1) {
            return res.status(404).json({ message: "Friend request not found" });
        }

        me.friendRequests[requestIndex].status = "accepted";

        if(!me.friends.map(String).includes(String(userId))) {
            me.friends.push(userId);
        }

        if(!them.friends.map(String).includes(String(myId))) {
            them.friends.push(myId);
        }

        await me.save();
        await them.save();

        const requesterSocketId = getReceiverSocketId(userId);
        if(requesterSocketId) {
            const meData = await User.findById(myId).select("_id fullName profilePic");
            io.to(requesterSocketId).emit("FriendRequestAccepted", {newFriend: meData});
        }

        res.status(200).json({ message: "Friend request accepted" });
    } catch (error) {
        console.log("Error in acceptFriendRequest:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getFriends = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate(
            "friends",
            "_id fullName profilePic"
        );

        res.status(200).json(user.friends);
    } catch(error) {
        console.log("Error in getFriends:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getPendingRequest = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate(
            "friendRequests.from",
            "_id fullName profilePic"
        );
        const pending = (user.friendRequests || []).filter(r => r.status === 'pending');
        return res.status(200).json(pending);
    } catch (error) {
        console.log("Error in getPendingRequests:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const declineFriendRequest = async (req, res) => {
    try {
        const { userId } = req.params;
        const myId = req.user._id;

        const me = await User.findById(myId);

        const requestIndex = me.friendRequests.findIndex(
            (r) => String(r.from) === String(userId) && r.status === "pending"
        );

        if (requestIndex === -1)
            return res.status(400).json({ message: "No pending request from this user" });

        me.friendRequests.splice(requestIndex, 1); // remove it entirely
        await me.save();

        res.status(200).json({ message: "Friend request declined" });
    } catch (error) {
        console.log("Error in declineFriendRequest:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};