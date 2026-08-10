import mongoose from "mongoose";
import "dotenv/config";

const connectDB = async () => {
    try{
        mongoose.connection.on("disconnected", () => {
            console.log("MongoDB disconnected");
        });

        mongoose.connection.on("error", (err) => {
            console.error("MongoDB Error:", err.message);
        });
        const connection = await mongoose.connect(process.env.MONGO_URI );
        console.log("Connected to DB:", mongoose.connection.name, "| Host:", mongoose.connection.host);
        console.log('Database is connected successfully!');
        
    }
    catch(err){
        console.error('Failed to connect to MongoDB', err);
        process.exit(1); // Exit the process with failure
    }
};


export default connectDB;