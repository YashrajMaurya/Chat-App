import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";


export const ChatContext = createContext()

export const ChatProvider = ({ children }) => {

    const [messages, setMessages] = useState([])
    const [users, setUsers] = useState([])
    const [selectedUser, setSelectedUser] = useState(null)
    const [unseenMessages, setUnseenMessages] = useState({})

    const { axios, socket } = useContext(AuthContext)

    //fun to get all users for sidebar
    const getUsers = async () => {
        try {
            const {data} = await axios.get('/api/messages/users')
            if(data.success){
                setUsers(data.users)
                setUnseenMessages(data.unseenMessages)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    //fun to get messages for selected users
    const getMessages = async (userId) => {
        try {
            const {data} = await axios.get(`/api/messages/${userId}`)
            if(data.success){
                setMessages(data.messages)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    //fun to send message to sleected user
    const sendMessage = async (messageData) =>{
        try {
            const {data} = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData)
            if(data.success){
                setMessages((prevMess) => [...prevMess, data.newMessage])
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    //fun to subscribe to messages for selected user
    const subscribeToMessages = async() =>{
        if(!socket) return

        socket.on("newMessage" , (newMessage)=>{
            if(selectedUser && newMessage.senderId === selectedUser._id){
                newMessage.seen = true;
                setMessages((prevMess)=>[...prevMess, newMessage])
                axios.put(`/api/messages/mark/${newMessage._id}`)
            }else{
                setUnseenMessages((prevMess)=>({
                    ...prevMess,
                    [newMessage.senderId]: prevMess[newMessage.senderId] ? prevMess[newMessage.senderId] + 1 : 1
                }))
            }
        })
    }

    //fun to unsubscribe from messages
    const unsubscribeFromMessages = async() =>{
        if(socket) socket.off('newMessage')
    }

    useEffect(()=>{
        subscribeToMessages()
        return ()=> unsubscribeFromMessages();
    },[socket, selectedUser])

    const value = {
        messages,
        users,
        selectedUser,
        getUsers,
        getMessages,
        sendMessage,
        setSelectedUser,
        unseenMessages,
        setUnseenMessages,
    }

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    )
}