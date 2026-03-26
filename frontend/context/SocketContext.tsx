"use client"

import { io, Socket } from "socket.io-client"
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { chat_service, useAppData } from "./AppContext";

interface SocketContextType {
    socket: Socket | null;
    onlineUsers: string[];
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    onlineUsers: []
})

interface ProviderProps{
    children: ReactNode;
}

export const SocketProvider = ({children} : ProviderProps)  => {
    const [socket, setSocket] = useState<Socket | null>(null)
    const { user } = useAppData();
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

    useEffect(() => {
        if(!user?._id) return;

        const newSocket = io(chat_service, {
            transports: ["websocket", "polling"],
            auth: {
                userId: user._id,
            },
            query: {
                userId: user._id,
            },
        });

        setSocket(newSocket);

        newSocket.on("connect", () => {
            console.log("Socket connected:", newSocket.id);
        });

        newSocket.on("getOnlineUser", (users: string[]) => {
            console.log("Received online users:", users);
            setOnlineUsers(users);
        });

        newSocket.on("disconnect", () => {
            console.log("Socket disconnected");
        });

        return () => {
            newSocket.disconnect();
        };
    }, [user?._id]);

    return <SocketContext.Provider value={{socket, onlineUsers}} > {children}</SocketContext.Provider>
}

export const SocketData = () => useContext(SocketContext);


