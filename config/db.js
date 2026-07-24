import mongoose from "mongoose";
import "dotenv/config";

const connectDB = async () => {
    try{
        
        await mongoose.connect(process.env.MONGO_URI );
            console.log('Database is connected successfully!');
        
    }
    catch(err){
        console.error('Failed to connect to MongoDB', err);
        process.exit(1); // Exit the process with failure
    }
};
export default connectDB;