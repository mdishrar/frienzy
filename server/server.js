import express from "express"
import http from "http"
import cors from "cors"
import "dotenv/config"
import { Server } from "socket.io"
import { connectDB } from "./lib/db.js"
import UserRouter from "./Routes/UseRoutes.js"
import messageRoutes from "./Routes/messageRouters.js"

const app = express();


app.use(express.json({limit : "4mb"}));
app.use(cors({
    methods : ["GET","POST","PUT"],
    credentials:true,
    origin : process.env.CLIENT_URL,
}))

const server = http.createServer(app)

export const io = new Server(server,{
    cors :{
        methods : ["GET","POST","PUT"],
        credentials:true,
        origin : process.env.CLIENT_URL,
    }
})

export const userSocketMap = {};

io.on('connection',(socket)=>{
    const userId = socket.handshake.query.userId;
    console.log("User Connected",userId);

    if(userId) userSocketMap[userId] = socket.id;
    io.emit('getOnlineUsers',Object.keys(userSocketMap));

    socket.on('disconnect',()=>{
        console.log('User disconnected' , userId),
        delete userSocketMap[userId];
        io.emit('getOnlineUsers',Object.keys(userSocketMap))
    })
})

// database check
app.use('/hello',(req,res)=>{
    res.send('<h1>asslamu alaikum</h1>')
})

//API end points
app.use('/api/auth',UserRouter)
app.use('/api/messages',messageRoutes)

await connectDB();
if(process.env.NODE_ENV !== "production"){
    const PORT = process.env.PORT;
    server.listen(PORT,()=>{
        console.log(`listening at http://localhost:${PORT}`);
    })
}
export default server;