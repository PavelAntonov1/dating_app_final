import MessageBox from "../messages/MessageBox";
import Message from "../messages/Message";
import SendMessageForm from "../forms/SendMessageForm";
import Cookies from "js-cookie";
import Compressor from "compressorjs";

import { useSelector } from "react-redux";
import { useRef, useState, useEffect } from "react";
import Pusher from "pusher-js";
import { FaArrowLeft } from "react-icons/fa";
import { Card } from "react-bootstrap";
import { Spinner } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { transliterate } from 'transliteration';

const ChatBox = (props) => {
  let params = useParams();
  let withUser = transliterate(params.username);

  const [chatroom, setChatroom] = useState("");
  const [isLeaving, setIsLeaving] = useState(false);
  const [users, setUsers] = useState([]);

  console.log("users: ");
  console.log(users);

  useEffect(() => {
    if (withUser === "select") return;

    let chatroomName = "";

    if (user.username.localeCompare(withUser) === 1) {
      chatroomName = `${user.username}-${withUser}`;
    }
    if (user.username.localeCompare(withUser) === -1) {
      chatroomName = `${withUser}-${user.username}`;
    }

    setChatroom(chatroomName);
  }, [withUser]);

  const user = useSelector((state) => state.user.user);

  const [scroll, setScroll] = useState(false);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const messageRef = useRef();

  const [file, setFile] = useState(null);
  const [fileURL, setFileURL] = useState(null);

  const [error, setError] = useState(null);

  const fetchMessages = () => {
    if (
      (messages.length === 0 || !messages) &&
      chatroom != null &&
      withUser !== "select" &&
      chatroom.length > 0
    ) {
      fetch(`http://localhost:3001/api/messages/${chatroom}`, {
        headers: { Authorization: `Bearer ${Cookies.get("jwt")}` },
      })
        .then((res) => {
          if (!res.ok) {
            props.onStopLoadingChatbox();
          }

          return res.json();
        })
        .then((data) => {
          console.log(data);

          if (data.ok) {
            console.log(data.messages);
            setMessages(data.messages);
          }

          props.onStopLoadingChatbox();
        })
        .catch((err) => console.error(err))
    } else {
      props.onStopLoadingChatbox();
    }
  };

  const changeFileHandler = async (e) => {
    const file = e.target.files[0];
    e.target.value = '';

    if (!file) return;

    if (file?.type.startsWith("image")) {
      const compressedImage = await new Promise((resolve) => {
        new Compressor(file, {
          quality: 0.8,
          maxHeight: 400,
          maxWidth: 400,
          mimeType: file.type,
          success(result) {
            resolve(result);
          },
          error(err) {
            console.error(err);
            resolve(file);
          },
        });
      });
      if (compressedImage.size < 100950) {
        setError(null);
        setFile(compressedImage);
        setFileURL(URL.createObjectURL(compressedImage));
      } else {
        setError(
          "Выбранное изображение слишком тяжелое. Выберите изображение не больше 1мб"
        );
      }
    }

    if (file?.type.startsWith("video")) {
      if (file.size < 10485760) {
        setError(null);
        setFile(file);
        setFileURL(URL.createObjectURL(file));
      } else {
        setError(
          "Выбранное видео слишком тяжелое. Выберите видео не больше 10мб"
        );
      }
    }
  };

  const joinHandler = async () => {
    if (withUser === "select") {
      console.log("Please, select the dialogue");
      return;
    }

    const res = await fetch(`http://localhost:3001/api/join/${chatroom}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Cookies.get("jwt")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user: user.username }),
    });

    const data = await res.json();

    data.ok && console.log(`Joined chatroom: ${chatroom}`);
  };

  const leaveHandler = async () => {
    const res = await fetch(`http://localhost:3001/api/leave/${chatroom}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Cookies.get("jwt")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user: user.username }),
    });

    const data = await res.json();

    data.ok && console.log(`Left chatroom: ${chatroom}`);
  };

  useEffect(() => {
    if (chatroom === "" || !chatroom || !chatroom.includes(withUser)) return;

    // joining the user to the chatroom
    joinHandler();

    fetch(`http://localhost:3001/api/users-inside/${chatroom}`, {
      headers: {
        Authorization: `Bearer ${Cookies.get("jwt")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setUsers(data.users);
        }
      })
      .catch((err) =>
        console.err(`Error while fetching users inside ${chatroom} from client`)
      );

    const pusher = new Pusher("9d8aec400fcc13d51074", {
      cluster: "eu",
    });

    const channel = pusher.subscribe(chatroom);

    channel.bind("message", (message) => {
      if (message.message.sender !== user.username) {
        setMessages((messages) => [...messages, message.message]);

        setScroll(true);

        setTimeout(() => {
          setScroll(false);
        }, 20);
      }
    });

    channel.bind("user-joined", (username) => {
      console.log(`User ${username} joined`);

      if (!users.includes(username)) {
        setUsers((prevUsers) => [...prevUsers, username]);
      }
    });

    channel.bind("user-left", (username) => {
      console.log(`User ${username} left`);

      setUsers((prevUsers) => {
        const newUsers = prevUsers.filter((user) => user !== username);

        return newUsers;
      });
    });

    channel.bind("update", () => {
      fetchMessages();
    });

    return () => {
      pusher.unsubscribe(chatroom);
    };
  }, [chatroom, withUser]);

  useEffect(() => {
    fetchMessages();
  }, [chatroom]);

  useEffect(() => {
    return () => {
      console.log(chatroom);
      if (chatroom != "" && chatroom != null) {
        leaveHandler();
        setIsLeaving(true);

        setTimeout(() => {
          setIsLeaving(false);
        }, 200);

        setMessages([]);
      }
    };
  }, [chatroom, withUser]);

  const submitMessageHandler = async (e) => {
    e.preventDefault();
    console.log(chatroom);
    if (message.length > 0 || file) {
      setMessage({ text: messageRef.current.value.trim(), file });

      const newMessage = {
        text: message,
        sender: user.username,
        createdAt: Date.now(),
      };

      const formData = new FormData();
      formData.append("message", JSON.stringify(newMessage));

      if (file) {
        formData.append("message-file", file);
      }

      if (users.findIndex((username) => username === withUser) === -1) {
        newMessage.readByRecipent = false;
      }

      const res = await fetch(
        `http://localhost:3001/api/messages/${chatroom}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${Cookies.get("jwt")}`,
          },
          body: formData,
        }
      );

      const data = await res.json();

      console.log(data);

      if (data.ok) {
        setMessages((messages) => [...messages, { ...newMessage, fileURL }]);
        setScroll(true);

        setTimeout(() => {
          setScroll(false);
        }, 20);
      }

      setFile(null);
      setFileURL(null);
      setError(null);
      setMessage("");
    } else {
      console.error("Nothing to send");
    }
  };

  const messageChangeHandler = () => {
    setMessage(messageRef.current.value);
  };

  let content = (
    <div
      className="chatbox d-flex flex-column gap-3 h-100 w-100"
      style={{ flex: 4 }}
    >
      <MessageBox scroll={scroll}>
        {(messages.length === 0 || !messages) &&
          !props.isLoading &&
          !isLeaving && (
            <p className="text-center text-muted">
              Нет сообщений с данным пользователем...
            </p>
          )}

        {(messages.length === 0 || messages != null) &&
          messages.map((msg, i) => {
            console.log(msg);
            return (
              <Message
                key={i}
                belongsToUser={msg.sender === user.username ? true : false}
                text={msg.text}
                createdAt={msg.createdAt}
                fileURL={
                  msg.fileURL ||
                  (msg.file?.data &&
                    URL.createObjectURL(
                      new Blob([new Uint8Array(msg.file.data.data)], {
                        type: msg.file.contentType,
                      })
                    ))
                }
                isImage={msg.file?.contentType?.startsWith("image") ?? false}
              />
            );
          })}
      </MessageBox>

      <SendMessageForm
        ref={messageRef}
        inputValue={message}
        onSubmit={submitMessageHandler}
        onChange={messageChangeHandler}
        onChangeFile={changeFileHandler}
        fileURL={fileURL}
        isImage={file?.type.startsWith("image")}
        error={error}
      />
    </div>
  );

  if (withUser === "select") {
    content = (
      <Card
        className="d-flex flex-row gap-3 display-5 w-100 justify-content-center align-items-center"
        style={{ height: "auto" }}
      >
        <div className="d-flex align-items-center">
          <FaArrowLeft className="text-muted" />
        </div>
        <span className="text-muted">Выберите диалог...</span>
      </Card>
    );
  }

  if (props.isLoading) {
    content = (
      <Card
        className="spinner-container d-flex flex-row gap-3 display-5 w-100 justify-content-center align-items-center"
        style={{ height: "auto" }}
      >
        <Spinner
          animation="border"
          variant="primary"
          role="status"
          aria-hidden="true"
          as="span"
          style={{
            width: "5rem",
            height: "5rem",
          }}
        />
      </Card>
    );
  }

  return content;
};

export default ChatBox;
