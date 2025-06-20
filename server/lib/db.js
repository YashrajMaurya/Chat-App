import mongoose, { mongo } from "mongoose";

//fun to connecr to db
export const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => console.log('DB Connected'))
        await mongoose.connect(`${process.env.MONGODB_URI}/chatapp`)
    } catch (error) {
        console.log(error);
    }
}