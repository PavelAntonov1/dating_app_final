import yandexIcon from "../../icons/yandex.png";
import mailruIcon from "../../icons/mailru.png";
import vkIcon from "../../icons/vk.png";

import ReactDOM from "react-dom";
import { Button, Spinner } from "react-bootstrap";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Overlay from "../overlay/Overlay";
import AdditionalInfoForm from "../forms/AdditionalInfoForm";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logIn, setUser } from "../../state/userActions";
import { serverName } from "../../config";

const AuthButton = (props) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [service, setService] = useState({
    clientId: null,
    clientSecret: null,
    accessToken: null,
    serviceName: props.icon,
  });

  const [additionalInfo, setAdditionalInfo] = useState({
    gender: false,
    email: false,
    dateOfBirth: false,
    city: false,
    region: false,
  });

  const [userInfo, setUserInfo] = useState(null);

  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [isLoadingRegistration, setIsLoadingRegistration] = useState(false);

  const isLoggedIn = useSelector((state) => state.user.user);

  let iconSrc;

  if (props.icon === "yandex") {
    iconSrc = yandexIcon;
  }

  if (props.icon === "mailru") {
    iconSrc = mailruIcon;
  }

  if (props.icon === "vk") {
    iconSrc = vkIcon;
  }

  useEffect(() => {
    if (service.serviceName === "yandex") {
      fetch(`${serverName}/api/yandex-data`)
        .then((res) => {
          if (res.ok) {
            return res.json();
          } else {
            setIsLoadingPage(false);
          }
        })
        .then((data) => {
          if (data.ok) {
            setService((prevService) => {
              return {
                ...prevService,
                clientId: data.YANDEX_CLIENT_ID,
                clientSecret: data.YANDEX_CLIENT_SECRET,
                serviceName: "yandex",
              };
            });
          } else {
            setIsLoadingPage(false);
          }
        });
    }

    if (service.serviceName === "mailru") {
      fetch("${serverName}/api/mailru-data")
        .then((res) => {
          if (res.ok) {
            return res.json();
          } else {
            setIsLoadingPage(false);
          }
        })
        .then((data) => {
          if (data.ok) {
            setService((prevService) => {
              return {
                ...prevService,
                clientId: data.MAILRU_CLIENT_ID,
                clientSecret: data.MAILRU_CLIENT_SECRET,
                serviceName: "mailru",
              };
            });
          } else {
            setIsLoadingPage(false);
          }
        });
    }
  }, []);

  const authUserHandler = async () => {
    setIsLoadingPage(true);

    console.log(service.serviceName);

    if (service.serviceName === "yandex" && service.clientId) {
      const redirectUrl = `https://oauth.yandex.ru/authorize?response_type=code&client_id=${service.clientId}`;
      window.location.href = redirectUrl;
    }

    if (service.serviceName === "mailru" && service.clientId) {
      const redirectUrl = `https://oauth.mail.ru/login?client_id=${service.clientId}&response_type=code&scope=userinfo&redirect_uri=${serverName}/homepage&state=79ad0a17c707cb7a98d8d9c4065cf1f5c5fb5d8ee5fa1c2b5ca5bda7b9398d9d`;
      window.location.href = redirectUrl;
    }
  };

  useEffect(() => {
    setAdditionalInfo({ gender: false, email: false, dateOfBirth: false });

    const searchParams = new URLSearchParams(window.location.search);
    const authCode = searchParams.get("code");

    if (authCode) {
      console.log(`Auth code received: ${authCode}`);
      setIsLoadingPage(true);
    } else {
      console.log("No auth code received");
    }

    if (
      authCode &&
      !isLoggedIn &&
      service.clientId &&
      service.clientSecret &&
      service.serviceName === "yandex"
    ) {
      fetch("https://oauth.yandex.ru/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `grant_type=authorization_code&code=${authCode}&client_id=${service.clientId}&client_secret=${service.clientSecret}`,
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          if (data.access_token) {
            setService((prevService) => {
              return { ...prevService, accessToken: data.access_token };
            });
          }
        })
        .catch((error) => console.error(error));
    }

    if (
      authCode &&
      !isLoggedIn &&
      service.clientId &&
      service.clientSecret &&
      service.serviceName === "mailru"
    ) {
      fetch(`${serverName}/api/mailru/accessToken/${authCode}`)
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          if (data.access_token) {
            setService((prevService) => {
              return { ...prevService, accessToken: data.access_token };
            });
          }
        })
        .catch((error) => console.error(error));
    }

    setTimeout(() => setIsLoadingPage(false), 2000);
  }, [service.clientId, service.clientSecret]);

  console.log(service);

  useEffect(() => {
    console.log("Fetching user info: ");
    console.log(service);

    if (service.accessToken && service.serviceName === "yandex") {
      fetch(`${serverName}/api/yandex/user/${service.accessToken}`)
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          if (data.ok) {
            setUserInfo({
              ...data.user,
              gender: data.user.sex,
              username: data.user.default_email.split("@")[0],
              email: data.user.default_email,
              dateOfBirth: new Date(data.user.birthday),
            });
          }
          setIsLoadingPage(false);
        })
        .catch((error) => console.error(error));
    }

    if (service.accessToken && service.serviceName === "mailru") {
      fetch(`${serverName}/api/mailru/user/${service.accessToken}`)
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          if (data.ok) {
            setUserInfo({
              ...data.user,
              gender:
                (data.user.gender &&
                  (data.user.gender === "m" ? "male" : "female")) ||
                null,
              username: data.user.email.split("@")[0],
              dateOfBirth: new Date(
                data.user.birthday.split(".").reverse().join("-")
              ),
            });
          }
          setIsLoadingPage(false);
        })
        .catch((error) => console.error(error));
    }
  }, [service.serviceName, service.accessToken]);

  useEffect(() => {
    console.log("Changing isLoadingPage");
    isLoadingPage && setIsLoadingPage(false);
    console.log(isLoadingPage);

    userInfo &&
      fetch(`${serverName}/api/users/${userInfo.username}/exists`)
        .then((res) => res.json())
        .then((data) => {
          if (!data.ok && !data.isFound) {
            setIsLoadingPage(false);

            if (
              userInfo &&
              (userInfo.gender?.length === 0 || !userInfo.gender)
            ) {
              console.log(userInfo.gender);
              setAdditionalInfo((prevInfo) => {
                return { ...prevInfo, gender: true };
              });

              console.log("User needs to set gender");
            }

            if (
              userInfo &&
              (!userInfo.birthday || userInfo.birthday.length === 0)
            ) {
              setAdditionalInfo((prevInfo) => {
                return { ...prevInfo, dateOfBirth: true };
              });

              console.log("User needs to set DOB");
            }

            if (userInfo && (!userInfo.city || userInfo.city.length === 0)) {
              setAdditionalInfo((prevInfo) => {
                return { ...prevInfo, city: true };
              });

              console.log("User needs to set city");
            }

            if (
              userInfo &&
              (!userInfo.region || userInfo.region.length === 0)
            ) {
              setAdditionalInfo((prevInfo) => {
                return { ...prevInfo, region: true };
              });

              console.log("User needs to set region");
            }
          } else {
            fetch(`${serverName}/api/login`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userEmail: userInfo.email,
                userPassword: userInfo.password + "",
                checkPassword: false,
              }),
              credentials: "include",
            })
              .then((res) => res.json())
              .then((data) => {
                if (data.loggedIn) {
                  dispatch(setUser(data.user));
                  setTimeout(() => dispatch(logIn()), 0);
                  setTimeout(() => navigate("/profile"), 1);
                }
              });
          }
        });
  }, [userInfo]);

  const registerUserHandler = async (additionalInfoObj) => {
    setIsLoadingRegistration(true);
    const userData = { ...userInfo, ...additionalInfoObj };
    let userGender;
    const userObj = {
      username: userData.username,
      email: userData.email,
      dateOfBirth: userData.dateOfBirth,
      password: Math.trunc(Math.random() * 1000000000),
      region: userData.region,
      city: userData.city,
      email: userData.email,
      gender: userData.gender,
      createdAt: new Date().toISOString(),
      isVip: false,
      isAdmin: false,
      profilePicture: null,
      photos: null,
    };

    const res = await fetch(`${serverName}/api/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userObj }),
    });

    const data = await res.json();

    console.log(data);
    if (data.ok || data.message.startsWith("This user")) {
      setAdditionalInfo({
        gender: false,
        email: false,
        city: false,
        region: false,
        dateOfBirth: false,
      });

      setService({
        clientId: null,
        clientSecret: null,
        accessToken: null,
        serviceName: props.icon,
      });

      const response = await fetch(`${serverName}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: userObj.email,
          userPassword: userObj.password + "",
          checkPassword: false,
        }),
        credentials: "include",
      });

      console.log(response);
      if (response.ok) {
        const data = await response.json();
        console.log(data);

        if (data.loggedIn) {
          dispatch(setUser(userObj));
          setTimeout(() => dispatch(logIn()), 0);
          setTimeout(() => navigate("/profile"), 1);
        }
      }

      console.log(userObj);
    }

    setIsLoadingRegistration(false);
  };

  console.log(isLoadingRegistration);
  console.log(isLoadingPage);

  return (
    <>
      {isLoadingPage && !isLoadingRegistration && (
        <Spinner
          animation="border"
          variant="primary"
          role="status"
          aria-hidden="true"
          as="span"
          style={{
            position: "fixed",
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
      )}

      {isLoadingPage &&
        !isLoadingRegistration &&
        ReactDOM.createPortal(
          <Overlay color="#fff" />,
          document.querySelector("#overlay")
        )}

      {isLoadingRegistration && !isLoadingPage && (
        <Spinner
          animation="border"
          variant="light"
          role="status"
          aria-hidden="true"
          as="span"
          style={{
            position: "fixed",
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
      )}
      {(additionalInfo.gender ||
        additionalInfo.email ||
        additionalInfo.dateOfBirth ||
        additionalInfo.city ||
        additionalInfo.region ||
        isLoadingRegistration) &&
        !isLoadingPage &&
        ReactDOM.createPortal(
          <Overlay color="rgba(0, 0, 0, 0.30)" />,
          document.querySelector("#overlay")
        )}

      {(additionalInfo.gender ||
        additionalInfo.email ||
        additionalInfo.dateOfBirth ||
        additionalInfo.city ||
        additionalInfo.region) &&
        !isLoadingPage &&
        !isLoadingRegistration && (
          <AdditionalInfoForm
            email={additionalInfo.email}
            gender={additionalInfo.gender}
            dateOfBirth={additionalInfo.dateOfBirth}
            city={additionalInfo.city}
            region={additionalInfo.region}
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              zIndex: "12",
              width: "25rem",
              transform: "translate(-50%, -50%)",
            }}
            onHideAdditionalInfoForm={() =>
              setAdditionalInfo({
                email: false,
                dateOfBirth: false,
                gender: false,
              })
            }
            onRegisterUser={registerUserHandler}
          />
        )}
      <Button variant={props.variant} onClick={authUserHandler}>
        <img
          src={iconSrc}
          alt={`icon-${props.icon}`}
          style={{ height: "1.5rem" }}
          className="mr-2"
        />
        {props.value}
      </Button>
    </>
  );
};

export default AuthButton;
