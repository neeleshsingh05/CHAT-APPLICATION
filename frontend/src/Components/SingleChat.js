import React, { useEffect, useState } from 'react'
import { FormControl } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { ChatState } from '../context/ChatProvider';
import { Box, Text } from "@chakra-ui/layout";
import axios from "axios";
import { IconButton, Spinner, useToast } from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { getSender,getSenderFull } from "../config/ChatLogics";
import ProfileModel from "./miscellneous/ProfileModel";
import UpdateGroupChatModal from './miscellneous/UpdateGroupChatModal';
import "./styles.css";
import ScrollableChat from './ScrollableChat';
import io from "socket.io-client";
import Lottie from "lottie-react";



const ENDPOINT = "http://localhost:5000";

var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [socketConnected, setSocketConnected] = useState(false);
    const [typing, setTyping] = useState(false);
    const [istyping, setIsTyping] = useState(false);
    const toast = useToast();


    const { selectedChat, setselectedChat, user, notification, setNotification } = ChatState();

    const fetchMessages = async () => {
        if (!selectedChat) return;
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            setLoading(true);

            const { data } = await axios.get(
                `/api/message/${selectedChat._id}`,
                config
            );
            setMessages(data);
            setLoading(false);
            socket.emit("join chat", selectedChat._id);
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: "Failed to Load the Messages",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
        }
    };
     useEffect(() => {
     socket = io(ENDPOINT);
     socket.emit("setup", user);
     socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));    
    }, []);

     useEffect(() => {
         fetchMessages();
         selectedChatCompare = selectedChat;
     }, [selectedChat]);
    
     useEffect(() => {
    socket.on("message recieved", (newMessageRecieved) => {
      if (
        !selectedChatCompare || // if chat is not selected or doesn't match current chat
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
          if (!notification.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification]);
          setFetchAgain(!fetchAgain);
          }
      } else {
        setMessages([...messages, newMessageRecieved]);
      }
    });
  });

    
    

    const sendMessage = async (event) => {
        if (event.key === "Enter" && newMessage) {
            socket.emit("stop typing", selectedChat._id);
            try {
                const config = {
                    headers: {
                        "Content-type": "application/json",
                        Authorization: `Bearer ${user.token}`,
                    },
                };
                setNewMessage("");
                const { data } = await axios.post(
                    "/api/message",
                    {
                        content: newMessage,
                        chatId: selectedChat._id,
                    },
                    config
                );
                socket.emit("new message", data);
                setMessages([...messages, data]);
            } catch (error) {
                toast({
                    title: "Error Occured!",
                    description: "Failed to send the Message",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                });
            };
        };
    };




    const typingHandler = async (e) => {
        setNewMessage(e.target.value);
        if (!socketConnected) return;
        if (!typing) {
            setTyping(true);
            socket.emit("typing", selectedChat._id);
        }
        let lastTypingTime = new Date().getTime();
        var timerLength = 3000;
        setTimeout(() => {
            var timeNow = new Date().getTime();
            var timeDiff = timeNow - lastTypingTime;
            if (timeDiff >= timerLength && typing) {
                socket.emit("stop typing", selectedChat._id);
                setTyping(false);
            }
        }, timerLength);
    };
    return (
        <>{
            selectedChat ? (
                <>
                    <Text
                        fontSize={{ base: "28px", md: "30px" }}
                        paddingBottom={'3'}
                        paddingX={'2'}
                        width={"100%"}
                        fontFamily="Work sans"
                        display={"flex"}
                        justifyContent={{ base: "space-between" }}
                        alignItems={"center"}
                    >
                         <IconButton
                                display={{ base: "flex", md: "none" }}
                                icon={<ArrowBackIcon />}
                                onClick={() => setselectedChat("")}
                        />
                        {!selectedChat.isGroupChat ? (
                            <>
                                {getSender(user, selectedChat.users)}
                                <ProfileModel
                                    user={getSenderFull(user, selectedChat.users)}
                                />
                            </>
                        ) : (
                            <>
                                {selectedChat.chatName.toUpperCase()}
                                    <UpdateGroupChatModal
                                        fetchAgain={fetchAgain}
                                        setFetchAgain={setFetchAgain}
                                         fetchMessages={fetchMessages}

                                    />
                                </>
                        )}                  
                    </Text>
                    <Box
                        display={"flex"}
                        flexDirection={"column"}
                        justifyContent={"flex-end"}
                        padding={'3'}
                        backgroundColor={"#E8E8E8"}
                        width={"100%"}
                        height={"100%"}
                        borderRadius={"lg"}
                        overflowY={"hidden"}
                    >
                        {loading ? (
                            <Spinner
                                size={"xl"}
                                width={'20'}
                                height={'20'}
                                alignSelf={"center"}
                                margin={"auto"}
                            />
                        ) : (
                                <div className="messages">   
                                    <ScrollableChat messages={messages} />
                                </div>
                        )}
                         <FormControl
                            onKeyDown={sendMessage}
                            id={"first-name"}
                            isRequired
                            marginTop={'3'}
                        >
                            {istyping ? (
                                 <div>
                                    Typing...
                                    </div>
                                ) : (
                                    <></>
                            )}
                             <Input
                                variant={"filled"}
                                backgroundColor={"#E0E0E0"}
                                placeholder={"Enter a message.."}
                                value={newMessage}
                                onChange={typingHandler}
                            />
                            </FormControl>

                    </Box>
                </>
            ) : (
                    <Box display={"flex"} alignItems={"center"} justifyContent={"center"} height={"100%"}>
                        <Text fontSize={"3xl"} paddingBottom={'3'} fontFamily={"Work sans"}>
                                Click on a user to start chatting
                    </Text>
                </Box>
            )}
        </>
    );
};

export default SingleChat;