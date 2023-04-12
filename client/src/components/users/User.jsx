import iconUserSm from "../../icons/icon-user-sm.png";
import { Button, Card, Image } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaComment } from "react-icons/fa";
import { useState } from "react";
import Cookies from "js-cookie";
import { useSelector } from "react-redux";
import Overlay from "../overlay/Overlay";
import ReactDOM from "react-dom";
import { Spinner } from "react-bootstrap";

const User = (props) => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);

  console.log(isLoggedIn);

  const [isLoading, setIsLoading] = useState(false);

  const goToUserHandler = (e) => {
    if (!isLoggedIn) {
      alert(
        "Зарегистрируйтесь, чтобы просматривать профили пользователей или писать им"
      );
      return;
    }

    console.log(e.target);
    if (e.target.classList.contains("clickable")) {
      navigate(`/profile/${props.username}`);
    }
  };

  const messageUserHandler = async () => {
    if (!isLoggedIn) {
      alert(
        "Зарегистрируйтесь, чтобы просматривать профили пользователей или писать им"
      );
      return;
    }

    setIsLoading(true);

    const res = await fetch(
      `http://localhost:3001/api/dialogues/${props.username}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Cookies.get("jwt")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ usernameClient: user.username }),
      }
    );

    const data = await res.json();

    console.log(data.message);

    setIsLoading(false);

    if (data.ok) {
      navigate(`../dialogues/${props.username}`);
    } else {
      console.error("Could not initiate a dialogue with the user selected");
    }
  };

  let content = (
    <Card
      style={props.style}
      className="d-flex flex-column user-container bg-white p-3 justify-content-start rounded clickable"
      onClick={goToUserHandler}
    >
      <div className="d-flex gap-3 clickable">
        <div
          className="user-icon-container clickable"
          style={{ width: "4rem", height: "4rem" }}
        >
          <Image
            src={
              (props.profilePicture != null &&
                URL.createObjectURL(
                  new Blob([new Uint8Array(props.profilePicture.data.data)], {
                    type: props.profilePicture.contentType,
                  })
                )) ||
              iconUserSm
            }
            alt="icon-user"
            className="userAvatar w-100 rounded h-100 clickable"
            style={{ objectFit: "cover" }}
          />
        </div>

        <div className="d-flex flex-column justify-content-center align-items-start clickable">
          <Card.Title className="clickable">
            {props.username} {props.gender === "male" ? "♂️" : "♀️"},{" "}
            {new Date(
              Date.now() - new Date(props.dateOfBirth).getTime()
            ).getFullYear() - 1970}
          </Card.Title>

          <Card.Subtitle className="user-location text-muted clickable">
            {props.city}, {props.region}
          </Card.Subtitle>
        </div>
      </div>

      <Button
        variant={props.long ? "success" : "secondary"}
        className="p-0 px-2 align-self-end mt-2 d-flex p-2 gap-2 align-items-center"
        onClick={messageUserHandler}
      >
        <FaComment style={{ color: "#fff" }} />
        {props.long && "Написать Сообщение"}
      </Button>
    </Card>
  );

  if (isLoading) {
    content = (
      <>
        {ReactDOM.createPortal(
          <Overlay color="#fff" />,
          document.querySelector("#overlay")
        )}

        <Spinner
          animation="border"
          variant="primary"
          role="status"
          aria-hidden="true"
          as="span"
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            right: "0",
            bottom: "0",
            margin: "auto",
            zIndex: "15",
            width: "5rem",
            height: "5rem",
          }}
        />
      </>
    );
  }
  return content;
};

export default User;
