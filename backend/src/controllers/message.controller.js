import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;

        // Get only friends, not all users
        const me = await User.findById(loggedInUserId)
            .populate("friends", "-password")
            .lean();

        const friends = me.friends || [];

        const usersWithUnread = await Promise.all(
            friends.map(async (user) => {
                const unreadCount = await Message.countDocuments({
                    senderId: user._id,
                    receiverId: loggedInUserId,
                    seen: false,
                });
                return { ...user, unreadCount };
            })
        );

        res.status(200).json(usersWithUnread);
    } catch (error) {
        console.log("Error in getUsersForSidebar:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getMessages = async(req, res) => {
    try {
        const { id:userToChatId } = req.params;
        const myId = req.user._id;

        await Message.updateMany(
            {
                senderId: userToChatId,
                receiverId: myId,
                seen: false,
            },
            { $set: { seen: true } }
        );

        const messages = await Message.find({
            $or: [
                { senderId:myId, receiverId: userToChatId},
                { senderId:userToChatId, receiverId: myId},
            ]
        })

        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in getMessages controller: ", error.message);
        res.status(500).json({error: "Internal server error"});
    }
};

export const sendMessages = async(req, res) => {
    try {
        const { text, image, video } = req.body;
        const { id:receiverId } = req.params;
        const senderId = req.user._id;

        let imageUrl;
        let videoUrl;
        if(image) {

            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        if(video) {
            const uploadResponse = await cloudinary.uploader.upload(video, { resource_type: "video" });
            videoUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
            video: videoUrl,
        });

        await newMessage.save();

        const receiverSocketId = getReceiverSocketId(receiverId);

        if(receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.log("Error in sendMessages controller: ", error.message);
        res.status(500).json({error: "Internal server error"});
    }
};

export const markAsSeen = async (req, res) => {
    try {
        const myId = req.user._id;
        const { id } = req.params;

        await Message.updateMany(
            {
                senderId: id,
                receiverId: myId,
                seen: false,
            },
            { $set: { seen: true } }
        );

        res.sendStatus(200);
    } catch (error) {
        console.log("Error in markAsSeen:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};