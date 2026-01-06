import Message from "../models/messageModel.js";
import User from "../models/userModels.js";
import cloudinary from "../lib/cloudinary.js"; 
import { io,userSocketMap } from "../server.js";

export const getUsersforSidebars = async (req,res) =>{
    try{
        const userId = req.user._id;
        const filteredUsers = await User.find({_id:{$ne : userId}}).select('-password');
        const unseenMessages = {};
        const promises = filteredUsers.map(async (user)=>{
            const messages = await Message.find({senderId: user._id,recieverId:userId,seen:false})
            if(messages.length > 0){
                unseenMessages[user._id] = messages.length;
            }
        })
        await Promise.all(promises);
        res.json({success:true,users : filteredUsers,unseenMessages});
    }catch(error){
        console.log(error.messages);
        res.json({success:false,messages: error.message})

    }
}

export const getMessages= async (req,res) =>{
    try{
        const {id:selectedUserId} = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or : [
                {senderId:myId,recieverId:selectedUserId},
                {senderId:selectedUserId,recieverId:myId},
            ]
        })
        await Message.updateMany({senderId:selectedUserId,recieverId:myId},{seen:true})
        res.json({success:true,messages})
    }catch(error){
        console.log(error.messages);
        res.json({success:false,messages: error.message})
    }
}

export const markMesssageAsSeen =  async (req,res) =>{
    try{
        const {id}  = req.params;
        await Message.findByIdAndUpdate(id,{seen:true})
        res.json({success:true})
    }catch(error){
        console.log(error.messages);
        res.json({success:false,messages: error.message})
    }
}

export const sendMessage = async (req,res)=>{
    try{
        const {text,image} = req.body;
        const recieverId = req.params.id;
        const senderId = req.user._id;
        let imageURL;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image)
            imageURL = uploadResponse.secure_url;
        }
        const newMessage = await Message.create({
            senderId,
            recieverId,
            text,
            image:imageURL
        })
        const recieverSocketId = userSocketMap[recieverId]
        if(recieverSocketId){
            io.to(recieverSocketId).emit('newMessage',newMessage)
        }
        res.json({success:true,newMessage});
    }catch(error){
        console.log(error.messages);
        res.json({success:false,messages: error.message})
    }
}