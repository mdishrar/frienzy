import express from 'express'
import "dotenv/config"
import cors from "cors"
import http from "http"
import connectDB from './lib/db.js';
import userRouter from './Router/userRouter.js';
import {Server} from "socket.io"
import messageRouter from './Router/messageRouter.js';

// application initiation
const app = express();
const server = http.createServer(app)

export const io = new Server(server,{
    cors:{origin: process.env.CLIENT_URL || "*"},
    methods : ["GET","POST"]
})

export const userSocketMap = {};

io.on("connection",(socket)=>{
    const userId= socket.handshake.query.userId;
    console.log("User Connected",userId);

    if(userId) userSocketMap[userId] = socket.id;
    io.emit('getOnlineUsers',Object.keys(userSocketMap));
    socket.on("disconnect",()=>{
    console.log("User Disconnected",userId);
    delete userSocketMap[userId];
    io.emit('getOnlineUsers',Object.keys(userSocketMap))
    })
})

//middewares
app.use(express.json({limit : "4mb"}))
app.use(cors())


app.use('/api/status',(req,res)=>{
    res.send('<h1>Hello World!!!!</h1>')
})

app.use('/api/auth',userRouter);
app.use('/api/messages',messageRouter);

//Database connection
await connectDB();

if(process.env.NODE_ENV !== 'production'){
    const PORT = process.env.PORT || 5000;
    server.listen(PORT,()=>{
    console.log(`listening at http://localhost:${PORT}`);
    })
}

export default server;
    
