import express from "express"
import { protectRoute } from "../lib/auth.js"
import { getMessages,markMesssageAsSeen,getUsersforSidebars, sendMessage } from "../controllers/messageControllers.js";

const messageRouter = express.Router();

messageRouter.get('/users',protectRoute,getUsersforSidebars);
messageRouter.get('/:id',protectRoute,getMessages);
messageRouter.put('/mark/:id',protectRoute,markMesssageAsSeen);
messageRouter.post('/send/:id',protectRoute,sendMessage)
export default messageRouter;