import { useEffect, useMemo, useState } from "react";
import { Card, Image, Button, Form, Spinner } from "react-bootstrap";
import { useParams } from "react-router-dom";
import FileButton from "../buttons/FileButton";
import Cookies from "js-cookie";
import { useDispatch } from "react-redux";
import { setUser } from "../../state/userActions";
import { serverName } from "../../config";

const UserPhotos = (props) => {
  const dispatch = useDispatch();

  const [photos, setPhotos] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [photoURL, setPhotoURL] = useState(null);

  const [isChanging, setIsChanging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [selected, setSelected] = useState(null);

  const params = useParams();

  const photoChangeHandler = (e) => {
    setIsChanging(true);

    setPhoto(e.target.files[0]);
    setPhotoURL(URL.createObjectURL(e.target.files[0]));
  };

  const photoSubmitHandler = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    console.log(photo);
    formData.append("photo", photo);

    const res = await fetch(
      `${serverName}/api/users/${props.user._id}/photos`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Cookies.get("jwt")}`,
        },
        body: formData,
      }
    );

    console.log(res);

    const data = await res.json();

    console.log("Response data: ");
    console.log(data);

    if (data.ok) {
      if (photos) {
        console.log("Data id:");
        console.log(data.id);
        props.onChangePhotos([...photos, { src: photoURL, _id: data.id }]);

        dispatch(
          setUser({
            ...props.user,
            photos: [...photos, { src: photoURL, _id: data.id }],
          })
        );

        setPhotos((photos) => [...photos, { src: photoURL, _id: data.id }]);
      } else {
        props.onChangePhotos([{ src: photoURL, _id: data.id }]);
        dispatch(
          setUser({
            ...props.user,
            photos: [{ src: photoURL, _id: data.id }],
          })
        );

        setPhotos([{ src: photoURL, _id: data.id }]);
      }

      setIsChanging(false);
    }
  };

  const photoDeleteHandler = async (id) => {
    console.log(selected);

    if (!selected) {
      console.error("No photo selected");
      return;
    }

    const res = await fetch(
      `${serverName}/api/users/${props.user._id}/photos/${selected}/delete`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Cookies.get("jwt")}`,
        },
      }
    );

    const data = await res.json();

    console.log(data);
    if (data.ok) {
      dispatch(
        setUser({
          ...props.user,
          photos: photos.filter((photo) => photo._id !== selected),
        })
      );

      setPhotos((photos) => photos.filter((photo) => photo._id !== selected));
      setSelected(null);
    }
  };

  useEffect(() => {
    console.log(props.user.username);
    fetch(`${serverName}/api/users/${props.user.username}/photos`, {
      headers: {
        Authorization: `Bearer ${Cookies.get("jwt")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);

        if (data.ok) {
          if (data.photos.length === 0 || !data.photos) {
            setPhotos([]);
          }

          const photosNew = data.photos.map((photo) => {
            const bufferArr = photo.data.data;

            const blob = new Blob([new Uint8Array(bufferArr)], {
              type: photo.contentType,
            });

            return { _id: photo._id, src: URL.createObjectURL(blob) };
          });

          if (photosNew.length > 0) {
            setPhotos(photosNew);
          } else {
            setPhotos([]);
          }
        }
      });

    // if (props.photos.length === 0 || !props.photos) {
    //   setPhotos(null);
    //   return;
    // }

    // setIsLoading(true);
    // setPhotos(
    //   props.photos.map((photo) => {
    //     console.log(photo);

    //     if (!photo.data) {
    //       return { _id: photo._id, src: photo.src };
    //     }
    //     const bufferArr = photo.data.data;

    //     const blob = new Blob([new Uint8Array(bufferArr)], {
    //       type: photo.contentType,
    //     });

    //     return { _id: photo._id, src: URL.createObjectURL(blob) }; // here
    //   })
    // );
    // setIsLoading(false);
  }, [props.user]);

  console.log(photos);
  console.log(props.photos);

  return (
    <Card>
      <Card.Header as="h3" className="p-4">
        {props.isClient ? "Мои Фото" : `Фото ${params.username}`}
      </Card.Header>
      <Card.Body
        className={`p-4 d-flex gap-4 ${
          (!photos || photos.length === 0 || isLoading) &&
          !isChanging &&
          "justify-content-center align-items-center"
        }`}
        style={{ overflowX: "auto" }}
      >
        {(!photos || photos.length === 0) && !isChanging && !isLoading && (
          <p className="text-muted text-center font-italic">
            У пользователя отсутствуют фотографии.
          </p>
        )}

        {!isLoading &&
          photos != null &&
          photos.length > 0 &&
          photos.map((photoObj) => {
            console.log(photoObj);
            return (
              <Image
                src={photoObj.src}
                style={{
                  maxWidth: "20rem",
                  maxHeight: "20rem",
                  cursor: "pointer",
                  transform:
                    selected === photoObj._id ? "scale(1.1)" : "scale(1)",
                  transition: "all 0.1s ease-in-out",
                }}
                className="rounded shadow-sm"
                key={photoObj._id}
                id={photoObj._id}
                onClick={() =>
                  setSelected((selected) =>
                    selected === photoObj._id ? null : photoObj._id
                  )
                }
              />
            );
          })}

        {isChanging && !isLoading && photoURL != null && (
          <Image
            src={photoURL}
            style={{
              maxWidth: "20rem",
              maxHeight: "20rem",
              opacity: "0.6",
            }}
            className="rounded"
          />
        )}

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
      </Card.Body>
      {props.isClient && (
        <Card.Footer className="d-flex justify-content-end p-4 align-items-center">
          <Form onSubmit={photoSubmitHandler}>
            <FileButton
              className={`p-2 rounded btn-primary ${!isChanging && "mx-2"}`}
              style={{ cursor: "pointer" }}
              name="photo"
              onChange={photoChangeHandler}
              id="photo-upload"
            >
              Добавить
            </FileButton>

            {isChanging && (
              <Button variant="success" className="p-2 mx-2" type="submit">
                Подтвердить
              </Button>
            )}

            <Button
              variant="danger"
              className="p-2"
              onClick={photoDeleteHandler}
            >
              Удалить
            </Button>
          </Form>
        </Card.Footer>
      )}
    </Card>
  );
};

export default UserPhotos;
