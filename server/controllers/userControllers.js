import User from "../models/userModels.js"
import generateToken from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";
import bcrypt from "bcryptjs"

export const Signup = async (req,res)=>{
    const {fullName,email,password,bio} = req.body;
    try{
        if(!fullName || !email || !password || !bio){
            return res.json({success:false,message:"Invalid Credentials"})
        }

        const user = await User.findOne({email})
        if(user){
            return res.json({success:false,message : "account already exists"})
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);
        const newUser = await User.create({
            fullName:fullName,email:email,password:hashedPassword,bio:bio
        })
        const token = generateToken(newUser._id);
        res.json({success:true,userData:newUser,token,message:"Account created Successfully"})

    }catch(error){
        console.log(error.message);
        res.json({success:false,message:error.message})
    }
}

export const Login = async (req,res)=>{
    const {email,password} = req.body;
    try{
        if(!email || !password){
            return res.json({success:false,message:"Invalid Credentials"})
        }

        const userData = await User.findOne({email})
        if(!userData){
            return res.json({success:false,message : "No account matched"})
        }

        const isCorrectPassword = await bcrypt.compare(password,userData.password);
        if(!isCorrectPassword){
            return res.json({success:false,message:"Invalid credentials"});
        }
        const token = generateToken(userData._id);
        res.json({success:true,userData,token,message:"Login Successfully"})

    }catch(error){
        console.log(error.message);
        res.json({success:false,message:error.message})
    }
}

export const checkAuth = (req,res) =>{
    res.json({success:true,user:req.user});
}

export const updateProfile = async (req,res) =>{
    try{
       const {profilePic,bio,fullName} = req.body;
       const userId = req.user._id;
       let updatedUser;
       if(!profilePic){
        updatedUser = await User.findByIdAndUpdate(userId,{bio,fullName},{new:true})
       }else{
        const upload = await cloudinary.uploader.upload(profilePic);
        updatedUser = await User.findByIdAndUpdate(userId,{profilePic:upload.secure_url,bio,fullName},{new:true,select : "-password"});
       }
       res.json({success:true,user:updatedUser})

    }catch(error){
        console.log(error.message);
        res.json({success:false,message:error.message})
    }
}