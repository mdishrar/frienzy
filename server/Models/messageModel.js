import mongoose from "mongoose";

const MessageModel = new mongoose.Schema({
    recieverId : {type: mongoose.Schema.Types.ObjectId,ref:"User",required:true},
    senderId : {type: mongoose.Schema.Types.ObjectId,ref:"User",required:true},
    seen : {type : Boolean,default : false},
    text : {type: String},
    image : {type : String},
    audio : {type : String},
},{timestamps : true})

const Message = mongoose.model("Message",MessageModel);

export default Message;