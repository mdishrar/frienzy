import Message from "../Models/messageModel.js";
import User from "../Models/userModel.js";
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
        await Message.updateMany({senderId:selectedUserId,recieverId:myId},{seen:true});
        res.json({success:true,messages})
    }catch(error){
        console.log(error.messages);
        res.json({success:false,messages: error.message})
    }
}

export const markMessageAsSeen =  async (req,res) =>{
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
        let audioURL;

        console.log('[DEBUG] Received request - req.file:', req.file ? { fieldname: req.file.fieldname, size: req.file.size, mimetype: req.file.mimetype } : 'undefined');
        console.log('[DEBUG] req.body:', { text: !!text, image: !!image });

        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image)
            imageURL = uploadResponse.secure_url;
        }

        if(req.file && req.file.buffer) {
            try {
                console.log('[DEBUG] Uploading audio to Cloudinary...', { size: req.file.buffer.length, mimetype: req.file.mimetype });
                const audioUpload = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { 
                    resource_type: "auto", 
                    folder: "chat_audios"
                    },
                    (error, result) => {
                    if (error) {
                        console.error('Cloudinary audio upload error:', error);
                        return reject(error);
                    }
                    console.log('Audio uploaded successfully:', result.secure_url);
                    resolve(result);
                    }
                ).end(req.file.buffer);
                });
                 audioURL = audioUpload.secure_url;
            } catch (audioError) {
                console.error('Audio upload failed:', audioError);
            }
        }

        const newMessage = await Message.create({
            senderId,
            recieverId,
            text,
            image:imageURL,
            audio : audioURL,
        })
        const recieverSocketId = userSocketMap[recieverId]
        if(recieverSocketId){
            io.to(recieverSocketId).emit('newMessage',newMessage)
        }
        res.json({success:true,newMessage});
    }catch(error){
        console.log(error.message);
        res.json({success:false,messages: error.message})
    }
}