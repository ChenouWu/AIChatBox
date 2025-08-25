import mongoose from 'mongoose';

export const connectDB = async ()=>{
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log("MongoDB connected Successfully");
    }catch(err){
        console.log(err);
        console.log("MongoDB connection failed");
    }
}