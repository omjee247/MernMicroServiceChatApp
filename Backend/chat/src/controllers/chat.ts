// import { getRecieverSocketId } from "../config/socket.js";
import { userInfo } from "os";
import tryCatch from "../config/TryCatch.js";
import { type AuthenticatedRequest } from "../middleware/isAuth.js";
import { Chat } from "../models/Chat.js";
import { Messages } from "../models/Messages.js";
// import axios from "../../node_modules/axios/index.cjs";
import axios from "axios";
import { getReceiverSocketId, io } from "../config/socket.js";


export const createNewChat = tryCatch(async (req : AuthenticatedRequest, res) => {

    const userId = req.user?._id;
    const {otherUserId} = req.body;

    if(!otherUserId){
        res.status(400).json({
            message: "Other userid is required",
        });
        return;
    }

    const existingChat  = await Chat.findOne({
        users : {$all: [userId, otherUserId], $size :2}
    })

    if(existingChat){
        res.json({
            message : "Chat already exist",
            chatId : existingChat._id,
        });
        return;
    }

    const newChat = await Chat.create({
        users: [userId, otherUserId]
    })

    res.status(201).json({
        message:"New Chat created",
        chatId: newChat._id
    })

})

export const getAllChats = tryCatch(async(req: AuthenticatedRequest, res) =>{

    const userId = req.user?._id;

    if(!userId){
        res.status(400).json({
            message: "UserId missing",
        });
        return;
    }

const chats = await Chat.find({ users: userId }).sort({ updatedAt: -1 });


const chatWithUserData = await Promise.all(

        chats.map(async (chat) =>{
            const otherUserId = chat.users.find((id)=> id != userId );

            const unseenCount = await Messages.countDocuments({
            chatId : chat._id,
            sender : {$ne : userId},
            seen: false
        });

        try{
            const {data} = await axios.get(
                `${process.env.USER_SERVICE}/api/v1/user/${otherUserId}`
            );

            return {
                user: data,
                chat: {
                    ...chat.toObject(),
                    latestMessages: chat.latestMessage || null,
                    unseenCount
                },
            };
        }
        catch(error){
            console.log(error);

            return {
                user: { _id: otherUserId, name: "Unknown User"},
                chat: {
                    ...chat.toObject(),
                    latestMessages: chat.latestMessage || null,
                    unseenCount
                },
            };
        }
    })
);

res.json({
    chats: chatWithUserData
})

} ) 

export const sendMessage = tryCatch(async (req: AuthenticatedRequest, res) => {
    const senderId = req.user?._id; 
    const {chatId, text} = req.body;
    const imageFile = req.file;

    if(!senderId){
        res.status(401).json({
            message: "unauthorized",
        })
        return;
    }

    if(!chatId){
        res.status(400).json({
            message: "Chat Id required",
        })
        return;
    }


    if(!text && !imageFile){
        res.status(400).json({
            message: "Either text or image is required"
        })
        return;
    }

    const chat  = await Chat.findById(chatId);

    if(!chat){
        res.status(404).json({
            message: "Chat not found"
        });
        return;
    }

    const isUserInChat = chat.users.some(
        (userId)=> userId.toString() === senderId.toString()
    );

    if(!isUserInChat){
        res.status(403).json({
            message: "You are not a participant of this chat",
        })
        return;
    }

    const otherUserId = chat.users.find(
        (userId) => userId.toString() !== senderId.toString()
    )

    if(!otherUserId){
        res.status(401).json({
            message: "No other user",
        })

        return;
    }


    // SOCKET SETUP

    const receiverSocketId = getReceiverSocketId(otherUserId.toString())
    let isReceiverInChatRoom = false;

    if(receiverSocketId){
        const receiverSocket = io.sockets.sockets.get(receiverSocketId);

        if(receiverSocket && receiverSocket.rooms.has(chatId)){
            isReceiverInChatRoom = true;
        }
    }

    let messageData: any = {
        chatId: chatId,
        sender: senderId,
        seen: isReceiverInChatRoom,
        seenAt: isReceiverInChatRoom ? new Date() : undefined,
    };

    if(imageFile){
        // multer-storage-cloudinary may place URL in different props depending on version
        const fileAny: any = imageFile as any;
        const imageUrl = fileAny.path || fileAny.secure_url || fileAny.url || fileAny.secureUrl;
        const publicId = fileAny.filename || fileAny.public_id || fileAny.publicId;
        messageData.image = {
            url: imageUrl,
            publicId: publicId,
        };

        messageData.messageType = 'image';
        messageData.text = text || "";
    }
    else{
        messageData.messageType = "text";
        messageData.text = text;
    }

    const message = new Messages(messageData);

    const savedMessage = await message.save();
    // Debug logs: inspect uploaded file info and saved message
    if (imageFile) {
        console.log('Uploaded file (multer):', imageFile);
        console.log('Saved message image:', savedMessage.image);
    }

    const latestMessageText = imageFile ? "📷 Image" : text;

    await Chat.findByIdAndUpdate(
        chatId,
        {
            latestMessage : {
                text : latestMessageText,
                sender : senderId,
            },
            updatedAt: new Date(),
        },
        {
            new : true
        }
    );


    // emit to sockets

    io.to(chatId).emit("newMessage", savedMessage)

    if(receiverSocketId){
        io.to(receiverSocketId).emit("newMessage", savedMessage);
    }

    const senderSocketId = getReceiverSocketId(senderId.toString())
    if(senderSocketId){
        io.to(senderSocketId).emit("newMessage", savedMessage);
    }

    if(isReceiverInChatRoom && senderSocketId){
        io.to(senderSocketId).emit("messageSeen", {
            chatId: chatId,
            seenBy: otherUserId,
            messageIds: [savedMessage._id]
        })
    }

    res.status(201).json({
        message : savedMessage,
        sender : senderId
        }
    )
})

export const getMessagesByChat = tryCatch(
    async (req: AuthenticatedRequest, res) =>{
 
        const userId = req.user?._id;
        const { chatId } = req.params;


        if(!userId){
            res.status(401).json({
                message: "Unauthorized",
            });
            return;
        }

        if(!chatId){
            res.status(400).json({
                message: "ChatId Required"
            })
            return;
        }

        const chat  = await Chat.findById(chatId);

        if(!chat){
            res.status(404).json({
                message: "Chat not found",
            });
            return;
        }

        const isUserInChat = chat.users.some(
            (userId) => userId.toString() === userId.toString()
        );

        if(!isUserInChat){
            res.status(403).json({
                message: "You are not a partcipant of this chat",
            });
            return;
        }

        const messageToMarkSeen = await Messages.find({
            chatId: chatId,
            sender: { $ne: userId},
            seen: false
        });

        await Messages.updateMany({
            chatId: chatId,
            sender : { $ne : userId},
            seen: false
        },
        {
            seen: true,
            seenAt: new Date()
        }
    );

        const messages = await Messages.find({ chatId }).sort({ createdAt: 1});
        const otherUserId = chat.users.find((id) => id !== userId);

        try{
            const{ data } = await axios.get(
                `${process.env.USER_SERVICE}/api/v1/user/${otherUserId}`
            );

            if(!otherUserId){
                res.status(400).json({
                    message: "No other user",
                });
                return;
            }

            // socket work

            if(messageToMarkSeen.length > 0){
                const otherUserSocketId = getReceiverSocketId(otherUserId.toString())

                if(otherUserSocketId){
                    io.to(otherUserSocketId).emit("messageSeen", {
                        chatId: chatId,
                        seenBy: userId,
                        messageIds: messageToMarkSeen.map((msg) => msg._id)
                    });
                }
            }

            res.json({
                messages,
                user: data,
            });

        }
        catch(error){
            console.log(error);
            res.json({
                messages,
                user: {_id: otherUserId, name: "Unknown User "}
            })
        }

    }
)

