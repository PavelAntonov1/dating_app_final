import { Card, Image, ListGroup, Button } from "react-bootstrap";
import iconUserSm from "../../icons/icon-user-sm.png";
import { FaTrash, FaFrown, FaUser } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Cookies from "js-cookie";
import { Spinner } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import {setUser} from "../../state/userActions.js";

const DialogueList = (props) => {
  const params = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { username } = params;

  const [users, setUsers] = useState([]);
  const user = useSelector((state) => state.user.user);

  console.log(user);

  const [isLoading, setIsLoading] = useState(false);

  const switchDialogueHandler = (e, newUsername) => {
    if (e.target.getAttribute("d") === null) {
      if (username !== newUsername) {
        props.onChangeActiveDialogue(newUsername);
        props.onLoadChatbox();
        navigate(`../dialogues/${newUsername}`);
      }
    }
  };

  const dialogueDeletionHandler = async (e, username) => {
    setIsLoading(true);

    if (!username || username.length === 0) return;

    const res = await fetch(`http://localhost:3001/api/dialogues/${user.email}/delete/${username}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Cookies.get("jwt")}`,
      },
    })

    const data = await res.json();

    console.log(data);

    if (data.ok) {
      dispatch(setUser({
        ...user,
        dialogueWith: user.dialogueWith.filter(id => id !== data.userDeletedId),
      }));

      setUsers((users) => users.filter(user => user._id !== data.userDeletedId));
      console.log(user);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    props.onChangeActiveDialogue(username);

    console.log(
      `Fetching the list of users who have a dialogue with ${user.username}`
    );

    setIsLoading(true);
    fetch(`http://localhost:3001/api/dialogues/${user.username}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${Cookies.get("jwt")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        if (data.ok && data.users != null) {
          setIsLoading(false);
          setUsers(data.users);
        }
      })
      .catch((err) => {
        setIsLoading(false);
        console.error(
          `Error while fetching dialogue users from client: ${err}`
        );
      });
  }, []);

  const goToUserHandler = (e, username) => {
      navigate(`/profile/${username}`);
  }

  return (
    <Card
      style={{ width: "25rem", overflowY: "auto", overflowX: "hidden" }}
      className="dialogue-list"
    >
      <ListGroup
        variant=""
        className={`w-100 h-100 d-flex ${
          (users.length === 0 || isLoading) &&
          "justify-content-center align-items-center"
        }`}
      >
        {isLoading && (
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
        )}
        {users.length === 0 && !isLoading && (
          <div className="text-muted p-5 d-flex align-items-center gap-3">
            <FaFrown style={{ height: "5rem", width: "5rem" }} />

            <span className="text-justify">
              У вас пока нет никаких диалогов с другими пользователями.
            </span>
          </div>
        )}
        {users.length > 0 &&
          users != null &&
          !isLoading &&
          users.map(
            (userObj, i) =>
              userObj && (
                <ListGroup.Item
                  className="d-flex gap-3 border align-items-center justify-content-between w-100 p-3"
                  style={{ cursor: "pointer" }}
                  active={props.activeDialogue === userObj.username}
                  onClick={(e) => switchDialogueHandler(e, userObj.username)}
                  key={userObj._id}
                >
                  <div className="d-flex align-items-center gap-3">
                    <div style={{ height: "3rem", width: "3rem" }}>
                      <Image
                        src={
                          userObj.profilePicture != null
                            ? URL.createObjectURL(
                                new Blob(
                                  [
                                    new Uint8Array(
                                      userObj.profilePicture.data.data
                                    ),
                                  ],
                                  {
                                    type: userObj.profilePicture.contentType,
                                  }
                                )
                              )
                            : iconUserSm
                        }
                        style={{ objectFit: "cover" }}
                        className="rounded w-100 h-100"
                      />
                    </div>
                    <span className="font-weight-bold">{userObj.username}</span>
                  </div>

                  <div className="d-flex gap-3">
                  <div className="user-icon">
                    <FaUser
                      className={`trash-icon justify-self-end ${
                        props.activeDialogue === userObj.username
                        ? "text-white"
                        : "text-muted"
                      } mr-2`}
                      style={{ cursor: "pointer", height: "2rem" }}
                      onClick={(e) => goToUserHandler(e, userObj.username)}
                      />
                  </div>
                  <div className="trash-icon">
                    <FaTrash
                      className={`trash-icon justify-self-end ${
                        props.activeDialogue === userObj.username
                        ? "text-white"
                        : "text-muted"
                      } mr-2`}
                      style={{ cursor: "pointer", height: "2rem" }}
                      onClick={(e) => dialogueDeletionHandler(e, userObj.username)}
                      />
                  </div>
                </div>
                </ListGroup.Item>
              )
          )}
      </ListGroup>
    </Card>
  );
};

export default DialogueList;
