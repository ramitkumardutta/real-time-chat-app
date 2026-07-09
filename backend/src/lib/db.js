import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB connected successfully to: ${conn.connection.host}`);
    } catch (error) {
        console.log("Error connecting to MongoDB:", error.message);
        process.exit(1);
    }
}