import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        fullName: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        profilePic: {
            type: String,
            default: "",
        },

        // Adjacency list (graph) — bidirectional friendship
        friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

        // Incoming friend requests
        friendRequests: [
            {
                from: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                status: { type: String, enum: ["pending", "accepted"], default: "pending" },
            }
        ],
        statusUpdates: [
            {
                text: { type: String, default: "" },
                mediaUrl: { type: String, default: "" },
                mediaType: { type: String, enum: ["image", "video", ""], default: "" },
                createdAt: { type: Date, default: Date.now },
                expiresAt: { type: Date, required: true },
            }
        ],
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;