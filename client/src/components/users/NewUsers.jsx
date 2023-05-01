import User from "./User";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useSelector } from "react-redux";
import { serverName } from "../../config";

const NewUsers = (props) => {
  const [usersList, setUsersList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const username = useSelector((state) => state.user.user?.username) || "guest";

  useEffect(() => {
    setIsLoading(true);

    fetch(`${serverName}/api/new-users/${username}`, {
      headers: { Authorization: `Bearer: ${Cookies.get("jwt")}}` },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        console.log(`${serverName}/api/new-users/${username}`);
        setUsersList(data.users);
      })
      .catch((err) => console.error(err));

    setIsLoading(false);
  }, []);

  console.log(usersList);
  let content = (
    <>
      <h4>Новые Лица</h4>

      <div className="d-flex flex-wrap justify-content-start gap-3 mt-3">
        {usersList.map((user) => (
          <User
            key={user._id}
            username={user.username}
            dateOfBirth={user.dateOfBirth}
            profilePicture={user.profilePicture ?? null}
            gender={user.gender}
            city={user.city}
            region={user.region}
            style={{ width: "20rem", cursor: "pointer" }}
          />
        ))}
      </div>
    </>
  );

  return <div className="new-users-container">{content}</div>;
};

export default NewUsers;
