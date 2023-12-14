import React, { useState } from 'react';
import { useDisclosure } from "@chakra-ui/hooks";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  FormControl,
  Input,
  useToast,
  ModalBody,
  ModalCloseButton,
  Button
} from '@chakra-ui/react';
import { Box } from "@chakra-ui/layout";
import axios from "axios";
import { ChatState } from '../../context/ChatProvider';
import UserBadgeItem from "../UserAvatar/UserBadgeItem";
import UserListItem from '../UserAvatar/UserListItem';

const GroupChatModal = ({ children }) => {
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const { user, chats, setchats } = ChatState();
  
  const handleGroup = async (userToAdd) => {
    if (selectedUsers.includes(userToAdd)) {
      toast({
        title: "User already added",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }
      setSelectedUsers([...selectedUsers, userToAdd]);
  };
  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
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
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };
  const handleDelete = async (delUser) => {
       setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
  }
  const handleSubmit = async () => {
    if (!groupChatName || !selectedUsers) {
      toast({
        title: "Please fill all the feilds",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(
        `/api/chat/group`,
        {
          name: groupChatName,
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        },
        config
      );
      setchats([data, ...chats]);
      onClose();
      toast({
        title: "New Group Chat Created!",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } catch (error) {
      toast({
        title: "Failed to Create the Chat!",
        description: error.response.data,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

    return (
      <>
        <span onClick={onOpen}>{children}</span>

        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader
              fontSize={"35px"}
              fontFamily={"Work sans"}
              display={"flex"}
              justifyContent={"center"}
            >Create Group Chat
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody
              display={"flex"} flexDirection={"column"} alignItems={"center"}
            >
              <FormControl>
                <Input placeholder='Chat Name' marginBottom={'3'} onChange={(e) => setGroupChatName(e.target.value)} />
              </FormControl>
              <FormControl>
                <Input placeholder='Add users eg: Guest, Neelesh, Rohan' marginBottom={'1'}
                  onChange={(e) => handleSearch(e.target.value)} />
              </FormControl>
              <Box width={"100%"} display={"flex"} flexWrap={"wrap"}>
                {selectedUsers.map((u) => (
                  <UserBadgeItem
                    key={user._id}
                    user={u}
                    handleFunction={() => handleDelete(u)}
                  />
                ))}
              </Box>
              {loading ? (
                // <ChatLoading />
                <div>Loading...</div>
              ) : (
                searchResult
                  ?.slice(0, 4)
                  .map((user) => (
                    <UserListItem
                      key={user._id}
                      user={user}
                      handleFunction={() => handleGroup(user)}
                    />
                  ))
              )}

            </ModalBody>

            <ModalFooter>
              <Button colorScheme={'blue'} onClick={handleSubmit}>
                Create Chat
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    )
  }
export default GroupChatModal;