import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import axios from "axios"
import {io} from "socket.io-client"
import { toast } from "react-hot-toast";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthProvider = ({children})=>{
    const [token,setToken]= useState(localStorage.getItem("token"))
    const [authUser,setAuthUser] = useState(null);
    const [onlineUsers,setOnlineUsers] = useState([]);
    const [socket,setSocket] = useState(null);

    const checkAuth = async ()=>{
        try{
            const {data} = await axios.get('/api/auth/check')
            if(data.success){
                setAuthUser(data.user);
                connectSocket(data.user)
            }
        }catch(error){
            toast.error(error.response?.data?.message || error.message);
        }
    } 

    const connectSocket = (userData) =>{
        if(!userData || socket?.connected) return;
        const newSocket = io(backendUrl,{
            query:{
                userId : userData._id,
            }
        });
        newSocket.connect();
        setSocket(newSocket);

        newSocket.on('getOnlineUsers',(userIds)=>{
            setOnlineUsers(userIds);
        })
    }

    const login = async(state,credentials)=>{
        try{
            const {data} = await axios.post(`/api/auth/${state}`,credentials);
            if(data.success){
                const user = data.user || data.userData;
                setAuthUser(user);
                connectSocket(user);
                axios.defaults.headers.common["token"] = data.token;
                setToken(data.token);
                localStorage.setItem("token",data.token)
                toast.success(data.message)
            }else{
                toast.error(error.message)
            }

        }catch(error){
            toast.error(error.message)
        }
    }
    const updatedProfile = async (body)=>{
        try{
            const {data} = await axios.put('/api/auth/update-profile',body)
            if(data.success){
                setAuthUser(data.user)
                toast.success("Profile updated successfully")
            } else {
                toast.error(data.message || 'Update failed')
            }
        
        }catch(error){
            toast.error(error.message)
        }
    } 

    const logout = async () =>{
        localStorage.removeItem("token");
        setToken(null);
        setAuthUser(null);
        setOnlineUsers([]);
        axios.defaults.headers.common['token'] = null;
        toast.success('logged out successfully');
        if(socket?.disconnect) socket.disconnect();

    }

    useEffect(()=>{
        if(token){
            axios.defaults.headers.common['token'] = token;
        }
        checkAuth();
    },[])

    const value = {
        axios,
        authUser,
        onlineUsers,
        socket,
        login,
        logout,
        updatedProfile,
    }
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}