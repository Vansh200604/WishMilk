import mongoose from "mongoose";
import "dotenv/config";

const connectDB = async () => {
    try{
        mongoose.connection.on('connected', () => {
            console.log('Database is connected successfully!');
        })
        await mongoose.connect(process.env.MONGO_URI + "wishmilk");
    }
    catch(err){
        console.error('Failed to connect to MongoDB', err);

    }
}
export default connectDB;