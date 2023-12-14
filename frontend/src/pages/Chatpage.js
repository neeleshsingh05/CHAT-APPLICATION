import { useState } from "react";
import ChatBox from "../Components/ChatBox";
import MyChats from "../Components/MyChats";
import SideDrawer from "../Components/miscellneous/SideDrawer";
import { ChatState } from "../context/ChatProvider";
import { Box } from "@chakra-ui/layout";

const Chatpage = () => {
    const { user } = ChatState();
    const [fetchAgain, setFetchAgain] = useState(false);

    return (
        <div style={{ width: "100%" }}>
            {user && <SideDrawer />}
            <Box
                display={'flex'}
                justifyContent={'space-between'}
                width={'100%'}
                height={'91.5vh'}
                padding={'10px'}
            >
                {user && <MyChats fetchAgain={fetchAgain} />}
                {user && <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />}
            </Box>
        </div>
    );
};

export default Chatpage;