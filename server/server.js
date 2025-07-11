import express from 'express';
import "dotenv/config"
import cors from 'cors';
import http from "http"
import { connectDB } from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import { Server } from 'socket.io';

const app = express()
const server = http.createServer(app)

//Initialize socket.io server
export const io = new Server(server, {
    cors: { origin: "*" }
})
//Sore online user
export const userSocketMap = {};  //{userId: socketId}

//Socket.io connectio handler
io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) userSocketMap[userId] = socket.id;

    //Emit online users to all connected clients
    io.emit('getOnlineUsers', Object.keys(userSocketMap));

    //Discoonect
    socket.on('disconnect', () => {
        delete userSocketMap[userId];
        io.emit('getOnlineUsers', Object.keys(userSocketMap))
    })
})

//middleware
app.use(express.json({ limit: "4mb" }))
app.use(cors())

app.use("/api/status", (req, res) => res.send("Server is live"))
app.use('/api/auth', userRouter);
app.use('/api/messages', messageRouter);

await connectDB()

if (process.env.NODE_ENV !== "production") {
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log('Server is Running'))
}

//Exporting server for vercel.
export default server;