import { useSelector } from "react-redux";
import AboutUser from "../users/AboutUser";
import UserProfileCard from "../users/UserProfileCard";
import { Container } from "react-bootstrap";
import UserPhotos from "../users/UserPhotos";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./ProfilePage.css";
import { serverName } from "../../config";

const ProfilePage = (props) => {
  const params = useParams();

  const userClient = useSelector((state) => state.user.user);
  const [user, setUser] = useState(userClient);
  console.log(user);
  const [photos, setPhotos] = useState(user.photos);

  const updateUserHandler = async () => {
    console.log("Updating <ProfilePage />");

    if (!props.isClient) {
      fetch(`${serverName}/api/users/${params.username}`)
        .then((res) => res.json())
        .then((data) => {
          console.log(data);

          if (data.ok) {
            console.log("Setting user");
            setUser(data.user);
          }
        })
        .catch((err) => console.error(err));
    } else {
      setUser(userClient);
    }
  };

  useEffect(() => {
    updateUserHandler();
  }, [props.isClient]);

  useEffect(() => {
    setPhotos(user.photos);
  }, [user]);

  const changePhotosHandler = (photos) => {
    console.log("Setting photos");
    console.log(photos);
    setPhotos(photos);
  };

  console.log("The user is: ");
  console.log(user);

  return (
    <Container className="profile-page-container d-flex flex-column gap-4 w-100 my-4 align-items-stretch justify-content-start">
      <div className="user-info-container d-flex w-100 gap-4 flex-row">
        <UserProfileCard
          user={user}
          isClient={props.isClient}
          onUpdateUser={updateUserHandler}
        />
        <AboutUser user={user} isClient={props.isClient} />
      </div>

      <UserPhotos
        user={user}
        photos={photos ?? []}
        onChangePhotos={changePhotosHandler}
        isClient={props.isClient}
      />
    </Container>
  );
};

export default ProfilePage;
