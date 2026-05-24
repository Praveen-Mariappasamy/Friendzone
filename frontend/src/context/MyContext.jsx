import React, { createContext, useState } from "react";

const MyContext = createContext();

const MyContextProvier = ({ children, socket }) => {
  const [loggedUser, setLoggedUser] = useState(() => {
    const userInfo = localStorage.getItem("userInfo");
    return userInfo ? JSON.parse(userInfo) : undefined;
  });

  const [friendReq_response, setFriendReq_response] = useState(false);
  const [fetchPostAgain, setFetchPostAgain] = useState(false);
  const [noti, setNoti] = useState([]);
  const [chatContext, setChatContext] = useState({ mode: "social" });

  return (
    <MyContext.Provider
      value={{
        loggedUser,
        setLoggedUser,
        socket,
        friendReq_response,
        setFriendReq_response,
        fetchPostAgain,
        setFetchPostAgain,
        noti,
        setNoti,
        chatContext,
        setChatContext,
      }}
    >
      {children}
    </MyContext.Provider>
  );
};

export { MyContext, MyContextProvier };
