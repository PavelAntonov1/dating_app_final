import { Card } from "react-bootstrap";
import { useEffect, useRef, useLayoutEffect} from "react";
import React from "react";

const MessageBox = (props) => {
  const messageBoxRef = useRef();

  useEffect(() => {
    if (props.scroll) {
      setTimeout(() => {
        messageBoxRef.current.scrollTo({
          left: 0,
          top: messageBoxRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 400);
    }
  }, [props.scroll]);

  useEffect(() => {
    setTimeout(() => {
      messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
    }, 0)
  }, []);

  return (
    <Card
      className="message-box w-auto d-flex-flex-column gap-3 p-4 h-100"
      style={{
        overflowY: "scroll",
        scrollbarWidth: "none" /* Firefox */,
        "-ms-overflow-style": "none" /* Internet Explorer and Edge */,
        "&::-webkit-scrollbar": {
          display: "none",
        } /* Chrome */,
      }}
      ref={messageBoxRef}
    >
      {props.children}
    </Card>
  );
};

export default MessageBox;
