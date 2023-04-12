import { Container } from "react-bootstrap";
import { useParams } from "react-router-dom";
import ChatBox from "../chat/ChatBox";
import DialogueList from "../chat/DialogueList";
import { useState } from "react";
import "./ChatPage.css";

const ChatPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeDialogue, setActiveDialogue] = useState("select");

  const startLoadingChatboxHandler = () => {
    setIsLoading(true);
  };

  const stopLoadingChatboxHandler = () => {
    setIsLoading(false);
  };

  const changeActiveDialogueHandler = (dialogue) => {
    console.log(`Changing active dialogue to ${dialogue}`);
    setActiveDialogue(dialogue);
  };

  return (
    <Container
      className="chat-page-container w-100 d-flex gap-3 my-4 align-items-stretch justify-content-start"
      style={{ height: "90%" }}
    >
      <DialogueList
        onLoadChatbox={startLoadingChatboxHandler}
        onChangeActiveDialogue={changeActiveDialogueHandler}
        activeDialogue={activeDialogue}
      />

      <ChatBox
        isLoading={isLoading}
        onStopLoadingChatbox={stopLoadingChatboxHandler}
        onStartLoadingChatbox={startLoadingChatboxHandler}
      />
    </Container>
  );
};

export default ChatPage;
