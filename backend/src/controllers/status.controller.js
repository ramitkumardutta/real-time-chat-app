import User from "../models/user.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import cloudinary from "../lib/cloudinary.js";

const STATUS_DURATION_MAX_HOURS = 24;

export const createStatus = async (req, res) => {
    try {
        const { text, durationHours, image, video } = req.body;
        const userId = req.user._id;
        const hasText = text && String(text).trim().length > 0;
        const hasImage = Boolean(image);
        const hasVideo = Boolean(video);

        if (!hasText && !hasImage && !hasVideo) {
            return res.status(400).json({ message: "Please provide text, an image, or a video for status." });
        }

        const hours = Math.min(Number(durationHours) || STATUS_DURATION_MAX_HOURS, STATUS_DURATION_MAX_HOURS);
        if (hours < 1) {
            return res.status(400).json({ message: "Status duration must be at least 1 hour" });
        }

        const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        let mediaUrl = "";
        let mediaType = "";

        if (hasImage) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            mediaUrl = uploadResponse.secure_url;
            mediaType = "image";
        }

        if (hasVideo) {
            const uploadResponse = await cloudinary.uploader.upload(video, { resource_type: "video" });
            mediaUrl = uploadResponse.secure_url;
            mediaType = "video";
        }

        user.statusUpdates = user.statusUpdates || [];
        user.statusUpdates.push({
            text: hasText ? String(text).trim() : "",
            mediaUrl,
            mediaType,
            expiresAt,
        });

        await user.save();

        const status = user.statusUpdates[user.statusUpdates.length - 1];

        const payload = {
            statusId: status._id,
            userId: user._id,
            fullName: user.fullName,
            profilePic: user.profilePic,
            text: status.text,
            mediaUrl: status.mediaUrl,
            mediaType: status.mediaType,
            mediaUrl: status.mediaUrl,
            mediaType: status.mediaType,
            createdAt: status.createdAt,
            expiresAt: status.expiresAt,
        };

        const friendIds = user.friends || [];
        friendIds.forEach((friendId) => {
            const socketId = getReceiverSocketId(String(friendId));
            if (socketId) {
                io.to(socketId).emit("newStatus", payload);
            }
        });

        res.status(201).json(payload);
    } catch (error) {
        console.log("Error in createStatus:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getFriendStatuses = async (req, res) => {
    try {
        const me = await User.findById(req.user._id).lean();
        const friendIds = me.friends || [];
        const now = new Date();

        const friendsWithStatuses = await User.find({
            _id: { $in: friendIds },
            "statusUpdates.expiresAt": { $gt: now },
        })
            .select("_id fullName profilePic statusUpdates")
            .lean();

        const statuses = friendsWithStatuses.flatMap((friend) => {
            const active = (friend.statusUpdates || []).filter(
                (status) => new Date(status.expiresAt) > now
            );
            return active.map((status) => ({
                statusId: status._id,
                userId: friend._id,
                fullName: friend.fullName,
                profilePic: friend.profilePic,
                text: status.text,
                mediaUrl: status.mediaUrl,
                mediaType: status.mediaType,
                createdAt: status.createdAt,
                expiresAt: status.expiresAt,
            }));
        });

        statuses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.status(200).json(statuses);
    } catch (error) {
        console.log("Error in getFriendStatuses:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getMyStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).lean();
        const now = new Date();
        const activeStatuses = (user.statusUpdates || [])
            .filter((status) => new Date(status.expiresAt) > now)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.status(200).json(activeStatuses[0] || null);
    } catch (error) {
        console.log("Error in getMyStatus:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
