import mongoose from "mongoose";

const connectDb = async() => {

    const url = process.env.MONGO_URI;

    if(!url){
        throw new Error("MONGO_URI is not defined in the environment variable");
    }

    try{
        await mongoose.connect(url, {
            dbName : "microserviceChatApp"
        })
        console.log("Connected to mongodb");
    }
    catch(error){
        console.error("Failed to connect to the mongoDb", error);
        process.exit(1);
    }

}


export default connectDb;

