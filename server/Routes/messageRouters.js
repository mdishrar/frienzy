import express from "express"
import { protectRoute } from "../middleware/Auth.js";
import {getUsersforSidebars,getMessages,markMessageAsSeen,sendMessage} from "../controllers/MessageControllers.js"
import upload from "../middleware/Multer.js";
const messageRoutes = express.Router();

messageRoutes.get('/users',protectRoute,getUsersforSidebars);
messageRoutes.get('/:id',protectRoute,getMessages)
messageRoutes.put('/mark/:id',protectRoute,markMessageAsSeen)
messageRoutes.post('/send/:id',protectRoute,upload.single("audio"),sendMessage)

export default messageRoutes;