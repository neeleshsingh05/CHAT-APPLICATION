import React, { useState } from 'react'
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Button } from "@chakra-ui/button";
import { Input , InputGroup, InputRightElement} from "@chakra-ui/input";
import { VStack } from "@chakra-ui/layout";
import { useToast } from '@chakra-ui/react'
import axios from "axios";
import { useHistory } from 'react-router-dom';
import { ChatState } from '../../context/ChatProvider';


const Signup = () => {
    const [show, setShow] = useState(false);
    const [name, setName] = useState();
    const [email, setEmail] = useState();
    const [confirmpassword, setConfirmPassword] = useState();
    const [password, setPassword] = useState();
    const [pic, setPic] = useState();
    const [picloading, setPicLoading] = useState(false);
    const toast = useToast();
    const history = useHistory();
    const { setUser } = ChatState();

    const handleClick = () => setShow(!show);

    const postDetails = (pics) => { 
        setPicLoading(true);
        if (pics === undefined) {
            toast({
                title: "Please Select an Image",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }

        if (pics.type === "image/jpeg" || pics.type === "image/png") {
            const data = new FormData();
            data.append("file", pics);
            data.append("upload_preset", "CHAT APP");
            fetch("https://api.cloudinary.com/v1_1/neelesh05", {
                method: "post",
                body: data,
                mode: "no-cors",
            }).then((res) => res.json())
              .then((data) => {
                    setPic(data.url.toString());
                    setPicLoading(false);
              })
                .catch((err) => {
                    console.log(err)
                    setPicLoading(false)
                });
            
        } else {
            toast({
                 title: "please Select an Image",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            })
            setPicLoading(false);
            return;
        }
    };

    const submitHandler = async() => { 
        setPicLoading(true);
        if (!name || !email || !password || !confirmpassword) {
            toast({
                title: "Please Fill all the Fields",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setPicLoading(false);
            return;
        }

        if (password !== confirmpassword) {
            toast({
                title: "Passwords Do not Match",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }

        try {
            const config = {
                headers: {
                    "Content-type": "application/json",
                },
            };

            const { data } = await axios.post("/api/user", { name, email, password, pic }, config);

            toast({
                title: "Registration Successful",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            setPicLoading(false);
            history.push("/chats");
        } catch (error) {
            toast({
                title: "Error occured!!",
                description: error.response.data.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setPicLoading(false);
        }
    };

    return (
        <VStack spacing='5px' color="black">
            <FormControl id='first-name' isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                    placeholder='Enter Your Name'
                    onChange={(e) =>
                        setName(e.target.value)
                    }
                />
            </FormControl>
            <FormControl id='email' isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                    placeholder='Enter Your Email'
                    onChange={(e) =>
                        setEmail(e.target.value)
                    }
                />
            </FormControl>
            <FormControl id='password' isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                    <Input
                        type={show ? "text" : "password"}
                        placeholder='Enter Your Password'
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                    />
                    <InputRightElement width="4.5rem">
                        <Button h="1.75rem" size="sm" onClick={handleClick}>
                            {show ? "Hide" : "Show"}
                        </Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>
            <FormControl id='password' isRequired>
                <FormLabel>Confirm Password</FormLabel>
                <InputGroup>
                    <Input
                        type={show ? "text" : "password"}
                        placeholder='Confirm Password'
                        onChange={(e) =>
                            setConfirmPassword(e.target.value)
                        }
                    />
                    <InputRightElement width="4.5rem">
                        <Button h="1.75rem" size="sm" onClick={handleClick}>
                            {show ? "Hide" : "Show"}
                        </Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>
            <FormControl id="pic">
                <FormLabel>
                    Upload Your Picture
                </FormLabel>
                <Input type="file" p={1.5} accept="image/*"
                    onChange={(e) => postDetails(e.target.files[0])}
                />
            </FormControl>
            <Button colorScheme='blue' width="100%" style={{ marginTop: 15 }}
                onClick={submitHandler} isLoading={picloading}>
                Sign Up
            </Button>

        </VStack>
    );
};

export default Signup