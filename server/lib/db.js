import mongoose from "mongoose";

const connectDB = async ()=>{
    try{
        mongoose.connection.on('connected',()=>{
            console.log('Database is connected!!');
        })
        await mongoose.connect(`${process.env.MONGODB_URI}/Cluster0`)
    }catch(err){
        console.log(err.message);
    }
}
export default connectDB;