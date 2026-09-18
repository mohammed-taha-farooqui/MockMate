const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;

        if (!mongoUri || mongoUri === "your_mongodb_connection_string") {
            console.warn("⚠️  [MongoDB] Warning: MONGO_URI is not set or is using the placeholder value in .env. Update MONGO_URI with a valid connection string to connect to your database.");
            return;
        }

        const conn = await mongoose.connect(mongoUri);
        console.log(`✅ [MongoDB] Connected successfully: ${conn.connection.host}`);
    } catch (error) {
        console.error("❌ [MongoDB] Connection failed:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;