import User from "../models/user.model";
import {getReceiverSocketId, io} from "../lib/socket";

export const serachUser = async (req, res) => {
    try {
        const { query } = req.query;
        const myId = req.user._id;

        if(!query) return res.status(400).json({ message: "Query is required" });

        const me = await User.findById(myId);

        const users = await User.find({
            fulName: { $regex: query, $option: "i"},
            _id: { $ne: myId },
        }).select("_id fullNmae profilePic");

        //* Annonate each user with relationship status

        const result = users.map((user) => {
            const isFriend = me.friends.map(String).includes(String(user._id));
            const isPending = me.friendRequests.some(
                (r) => String(r.form) === String(user._id) && r.status === "pendimg"
            );

            //* Check if I sent a request to them
            const sentRequest = user._id; // We check from their side below
            return {
                _id: user._id,
                fullname: user.fullName,
                profilePic: user.profilePic,
                isFriend,
                isPending,
            };
        });

        //* Also check if user sent a pending
        const meWithRequests = await User.findById(myId);



    } catch (error) {
        throw error;
    }
}