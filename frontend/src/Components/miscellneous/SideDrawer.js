import React, { useState } from 'react';
import { useDisclosure } from "@chakra-ui/hooks";
import { Box } from "@chakra-ui/layout";
import { Tooltip, Menu, MenuButton, MenuList, MenuItem , MenuDivider} from "@chakra-ui/react";
import { Button } from "@chakra-ui/button";
import { Text } from "@chakra-ui/layout";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Avatar } from "@chakra-ui/avatar";
import { ChatState } from '../../context/ChatProvider';
import ProfileModel from './ProfileModel';
import { useHistory } from "react-router-dom";
import { Input } from "@chakra-ui/input";
import { Spinner } from "@chakra-ui/spinner";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
} from "@chakra-ui/react";
import ChatLoading from '../ChatLoading';
import UserListItem from '../UserAvatar/UserListItem';
import { getSender } from '../../config/ChatLogics';
import NotificationBadge from "react-notification-badge";
import { Effect } from "react-notification-badge";


const SideDrawer = () => {
    const [search, setsearch] = useState("");
    const [searchResult, setsearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingChat, setloadingChat] = useState();

    const { user, setselectedChat,chats,setchats,  notification,
    setNotification, } = ChatState();
    const toast = useToast();
    const history = useHistory();
    const { isOpen, onOpen, onClose } = useDisclosure();
    
    const logoutHandler = () => {
        localStorage.removeItem("userInfo");
        history.push('/');
    };

    const handleSearch = async () => {
        if (!search) {
            toast({
                title: "Please Enter something in search",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top-left",
            });
            return;
        }

        try {
            setLoading(true);

            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.get(`/api/user?search=${search}`, config);

            setLoading(false);
            setsearchResult(data);
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: "Failed to Load the Search Results",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });
        };
    };
    const accessChat = async (userId) => {

        try {
            setloadingChat(true);
            const config = {
                headers: {
                    "Content-type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.post(`/api/chat`, { userId }, config);

            if (!chats.find((c) => c._id === data._id)) setchats([data, ...chats]);
            setselectedChat(data);
            setloadingChat(false);
            onClose();
        } catch (error) {
            toast({
                title: "Error fetching the chat",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });
        };
    };


    return (
        <>
            <Box
                display={"flex"}
                justifyContent={"space-between"}
                alignItems={"center"}
                backgroundColor={"white"}
                width={"100%"}
                padding={"5px 10px 5px 10px"}
                borderWidth={"5px"}
            >
                <Tooltip label="Search Users to Chat" hasArrow placement='bottom-end'>
                    <Button variant="ghost" onClick={onOpen}>
                        <i className="fa-solid fa-magnifying-glass"></i>
                        <Text display={{ base: "none", md: 'flex' }} px={'4'}>
                            Search User
                        </Text>
                    </Button>
                </Tooltip>
                <Text fontSize={"2xl"} fontFamily={"Work Sans"}>
                    WELCOME TO ROOM CHAT
                </Text>
                <div>
                    <Menu>
                        <MenuButton padding={'1'} >
                             <NotificationBadge
                                count={notification.length}
                                effect={Effect.SCALE}
                            />
                            <BellIcon fontSize={'2xl'} margin={'1'} />
                        </MenuButton>
                        <MenuList paddingLeft={'2'}>
                            {!notification.length && "No New Messages"}
                            {notification.map((notif) => (
                                <MenuItem
                                    key={notif._id}
                                    onClick={() => {
                                        setselectedChat(notif.chat);
                                        setNotification(notification.filter((n) => n !== notif));
                                    }}
                                    >
                                    {notif.chat.isGroupChat
                                        ? `New Message in ${notif.chat.chatName}`
                                        : `New Message from ${getSender(user, notif.chat.users)}`}
                                </MenuItem>
                            ))}
                            </MenuList>
                    </Menu>
                    <Menu>
                        <MenuButton as={Button} rightIcon={<ChevronDownIcon />} >
                            <Avatar size={'sm'} cursor={'pointer'} src={user.pic} name={user.name} />
                        </MenuButton>
                        <MenuList>
                            <ProfileModel user={user}>
                                <MenuItem>My Profile</MenuItem>
                            </ProfileModel>
                            <MenuDivider />
                            <MenuItem onClick={logoutHandler}>Logout</MenuItem>
                        </MenuList>
                    </Menu>
                </div>
            </Box>

             <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
                <DrawerBody>
                        <Box display={"flex"} paddingBottom={'2'}>
                    <Input
                        placeholder={"Search by name or email"}
                        marginRight={'2'}
                        value={search}
                        onChange={(e) => setsearch(e.target.value)}
                    />
                            <Button
                                onClick={handleSearch}
                            >Go</Button>
                    </Box>
                    {loading ? <ChatLoading /> :
                    (
                        searchResult?.map((user) => (
                        <UserListItem
                        key={user._id}
                        user={user}
                        handleFunction={() => accessChat(user._id)}
                        />
                    ))
                    )}
                        {loadingChat && <Spinner ml={"auto"} display={"flex"} />}
                    </DrawerBody>
                    </DrawerContent>
            </Drawer>
        </>
    );
};

export default SideDrawer;