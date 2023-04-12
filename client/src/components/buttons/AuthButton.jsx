import yandexIcon from "../../icons/yandex.png";
import mailruIcon from "../../icons/mailru.png";
import vkIcon from "../../icons/vk.png";

import { Button } from "react-bootstrap";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const AuthButton = (props) => {
  const [yandex, setYandex] = useState({
    clientId: null,
    clientSecret: null,
    accessToken: null,
  });
  const [userInfo, setUserInfo] = useState(null);

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
    fetch("http://localhost:3001/api/yandex-data")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setYandex({
            clientId: data.YANDEX_CLIENT_ID,
            clientSecret: data.YANDEX_CLIENT_SECRET,
          });
        }
      });
  }, []);

  const authUserHandler = async () => {
    const redirectUrl = `https://oauth.yandex.com/authorize?response_type=code&client_id=${yandex.clientId}`;

    window.location.href = redirectUrl;
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const authCode = searchParams.get("code");

    if (authCode) {
      console.log(`Auth code received: ${authCode}`);
    } else {
      console.log("No auth code received");
    }

    if (authCode && !isLoggedIn && yandex.clientId && yandex.clientSecret) {
      console.log(
        `Request body: grant_type=authorization_code&code=${authCode}&client_id=${yandex.clientId}&client_secret=${yandex.clientSecret}`
      );

      fetch("https://oauth.yandex.ru/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `grant_type=authorization_code&code=${authCode}&client_id=${yandex.clientId}&client_secret=${yandex.clientSecret}`,
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          if (data.access_token) {
            setYandex((prevYandex) => {
              return { ...prevYandex, accessToken: data.access_token };
            });
          }
        })
        .catch((error) => console.error(error));
    }
  }, [yandex.clientId, yandex.clientSecret]);

  useEffect(() => {
    if (yandex.accessToken) {
      fetch(`http://localhost:3001/api/yandex/user/${yandex.accessToken}`)
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          if (data.ok) {
            setUserInfo(data.user);
          }
        })
        .catch((error) => console.error(error));
    }
  }, [yandex.accessToken]);

  console.log(userInfo);

  return (
    <Button variant={props.variant} onClick={authUserHandler}>
      <img
        src={iconSrc}
        alt={`icon-${props.icon}`}
        style={{ height: "1.5rem" }}
        className="mr-2"
      />
      {props.value}
    </Button>
  );
};

export default AuthButton;
