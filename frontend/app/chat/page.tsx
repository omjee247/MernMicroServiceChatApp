"use client"

import ChatSidebar from "@/components/ChatSidebar";
import Loading from "@/components/Loading";
import { chat_service, useAppData, User } from "@/context/AppContext"
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import axios from "axios";
import ChatHeader from "@/components/ChatHeader";
import ChatMessages from "@/components/ChatMessages";
import MessageInput from "@/components/MesageInput";

export interface Message{
  _id: string;
  chatId: string;
  sender: string;
  text?: string;
  image?:{
    url: string;
    publicid: string;
  };
  messageType: "text" | "image";
  seen: boolean;
  seenAt?: string;
  createdAt: string;
}

const ChatApp = () => {

  const {loading, isAuth, logOutUser, chats, user: loggedInUser, users, fetchChats, setChats } = useAppData();

  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [user, setUser] = useState<User | null > (null);    
  const [showAllUser, setShowAllUser] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeOut, setTypingTimeOut] = useState<NodeJS.Timeout | null>(null);


  const router = useRouter();

  useEffect(() =>{
    if(!isAuth && !loading){
      router.push("/login");
    }
  }, [isAuth, router, loading]);

  const handleLogOut = () => logOutUser();

  const fetchChat = useCallback(async () => {
    if (!selectedUser) return;
    
    const token = Cookies.get("token");

    try{
      const { data } = await axios.get(
        `${chat_service}/api/v1/message/${selectedUser}`,
        {
          headers:{
            Authorization: `Bearer ${token}`,
          },
        }
      )
      setMessages(data.messages);
      setUser(data.user);
    }
    catch(error){
      console.log(error);
      toast.error("Failed to load messages");
    }
  }, [selectedUser]);

  async function createChat(u: User) {
    try {
      const token = Cookies.get("token");
      const {data} = await axios.post(`${chat_service}/api/v1/chat/new`, 
      {
        userId: loggedInUser?._id,
        otherUserId: u._id,
      },{
        headers:{
          Authorization: `Bearer ${token}`,
        },
      });

      setSelectedUser(data.chatId)
      setShowAllUser(false);
      await fetchChats();
    }
    catch(error){
      toast.error("Failed to start chat");
    }
  }

  const handleMessageSend = async(e:any, imageFile?: File | null)=>{
    e.preventDefault()

    if((!message.trim() && !imageFile) || !selectedUser) return;


    // socket work

    const token = Cookies.get("token");

    try{

      const formData = new FormData()
      formData.append("chatId", selectedUser)

      if(message.trim()){
        formData.append("text", message)
      }

      if(imageFile)
      {
        formData.append("image", imageFile);
      }

      const {data} = await axios.post(`${chat_service}/api/v1/message`, formData,
        {
          headers:{
            Authorization: `Bearer ${token}`,
            "Content-Type" : "multipart/form-data",
          },
        }
      );

      setMessages((prev) => {
        const currentMessages = prev || [];
        const messageExists = currentMessages.some(
          (msg) => msg._id === data.message._id
        );

        if(!messageExists){
          return [...currentMessages, data.message]
        }
        return currentMessages;
      })
      setMessage("")

      const displayText = imageFile ? "📷 image" : message;
    }
    catch(error : any){
      toast.error(error.response.data.message);
    }

  }

  const handleTyping = (value : string) => {
    setMessage(value);

    if(!selectedUser) return;

    // socket setup

  }

  useEffect(() => {
    if(selectedUser){
      fetchChat();
    }
  }, [selectedUser, fetchChat]);

  if(loading) return <Loading/>;
  return (
    <div className="min-h-screen flex bg-gray-900 text-white relative overflow-hidden">
      <ChatSidebar 
      sidebarOpen={sidebarOpen} 
      setSidebarOpen={setSidebarOpen}
      showAllUsers={showAllUser}
      setShowAllUsers={setShowAllUser}
      users={users}
      loggedInUser={loggedInUser}
      chats={chats}
      selectedUser={selectedUser}
      setSelectedUser={setSelectedUser}
      handleLogOut={handleLogOut}
      createChat = {createChat}
      />
      <div className="flex-1 flex flex-col justify-between p-4 backdrop-blur-xl bg-white/5 border-1 border-white/10">
          <ChatHeader 
          user = {user}
          setSidebarOpen={setSidebarOpen}
          isTyping={isTyping}
          />

          <ChatMessages 
            selectedUser={selectedUser}
            messages={messages}
            loggedInUser={loggedInUser}
          />

          <MessageInput
            selectedUser = {selectedUser}
            message = {message}
            setMessage = {handleTyping}
            handleMessageSend = {handleMessageSend}
          />
      </div>
    </div>
  )
}

export default ChatApp