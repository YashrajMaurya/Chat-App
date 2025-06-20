import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

//Signup
export const signup = async (req, res) => {
    const { fullName, email, password, bio } = req.body;

    try {
        if (!fullName || !email || !password || !bio) {
            return res.json({ success: false, message: "Missing Details" })
        }
        const user = await User.findOne({ email })
        if (user) {
            return res.json({ success: false, message: "Account already exists" })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({ fullName, email, password: hashedPassword, bio })
        const token = generateToken(newUser._id);

        res.json({ success: true, userData: newUser, token, message: 'Account Created Successfully' })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
} 

//Login
export const login = async (req,res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({email})
        const isPasswordCorrect = await bcrypt.compare(password, user.password)

        if(!isPasswordCorrect || !user){
            res.json({success:false, message: "Invalid Credentials"})
        }

        const token = generateToken(user._id)
        res.json({success:true, userData:user, token, message: 'Login Successfull'})
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

//Cotroller to check is user is authneticated
export const checkAuth = async (req,res) => {
    res.json({success:true, user: req.user});
}

//Controller to update user profie details 
export const updateProfile = async (req,res) =>{
    try {
        const {profilePic, bio, fullName} = req.body;

        const userID = req.user._id;
        let updatedUser;

        if(!profilePic){
            updatedUser = await User.findByIdAndUpdate(userID, {bio,fullName}, {new: true})
        }else{
            const upload = await cloudinary.uploader.upload(profilePic)
            updatedUser = await User.findByIdAndUpdate(userID, {bio,fullName,profilePic:upload.secure_url}, {new:true})
        }
        res.json({success:true, user:updatedUser})
    } catch (error) {
        console.log(error.message);
        res.json({success:false, message:error.message})
    }
}