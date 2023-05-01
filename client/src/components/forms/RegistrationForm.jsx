import { Card, Button, Form, Spinner } from "react-bootstrap";
import AuthButton from "../buttons/AuthButton";
import { useState, useRef } from "react";
import citiesRegions from "../../data/citiesRegions.json";
import EmailVerificationForm from "./EmailVerificationForm";

import { useDispatch } from "react-redux";
import { setUser, logIn, setError } from "../../state/userActions";
import { useNavigate } from "react-router-dom";
import { serverName } from "../../config";
import "./RegistrationForm.css";

const regions = [...new Set(citiesRegions.map((obj) => obj.region))];

const RegistrationForm = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [regionState, setRegion] = useState("Москва и Московская обл.");

  const [isLoading, setIsLoading] = useState(false);

  const [userDate, setUserDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [showPassword, setShowPassword] = useState(false);

  const [showEmailVerificationForm, setShowEmailVerificationForm] =
    useState(false);

  const [nameValid, setNameValid] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);

  const [emailValid, setEmailValid] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  const [passwordValid, setPasswordValid] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const [passwordConfirmValid, setPasswordConfirmValid] = useState(false);
  const [passwordConfirmTouched, setPasswordConfirmTouched] = useState(false);

  let nameClass = "";

  if (nameTouched) {
    nameClass = nameValid ? "is-valid" : "is-invalid";
  }

  let emailClass = "";

  if (emailTouched) {
    emailClass = emailValid ? "is-valid" : "is-invalid";
  }

  let passwordClass = "";

  if (passwordTouched) {
    passwordClass = passwordValid ? "is-valid" : "is-invalid";
  }

  let passwordConfirmClass = "";

  if (passwordConfirmTouched) {
    passwordConfirmClass = passwordConfirmValid ? "is-valid" : "is-invalid";
  }

  let formValid =
    nameValid && emailValid && passwordValid && passwordConfirmValid;

  const usernameRef = useRef(); // add check users in db to see if the name has been taken already
  const userEmailRef = useRef();
  const userPasswordRef = useRef();
  const userPasswordConfirmRef = useRef();

  const userDOBRef = useRef();

  const userGenderRef = useRef();

  const userCityRef = useRef();
  const userRegionRef = useRef();

  const changeDateHandler = (e) => {
    setUserDate(new Date(e.target.value).toISOString().split("T")[0]);
  };

  const changeRegionHandler = (e) => {
    setRegion(e.target.value);
  };

  const changeNameHandler = () => {
    const username = usernameRef.current.value;

    if (username.length === 0) {
      setNameValid(false);
    } else {
      setNameValid(true);
    }
  };

  const changeEmailHandler = () => {
    const userEmail = userEmailRef.current.value;

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    if (emailTouched) {
      if (!emailRegex.test(userEmail)) {
        setEmailValid(false);
      } else {
        setEmailValid(true);
      }
    }
  };

  const passwordChangeHandler = () => {
    const userPassword = userPasswordRef.current.value;

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={}[\]\\|:;"'<>,.?/~])(?=.{8,})/;

    if (passwordTouched) {
      if (!passwordRegex.test(userPassword)) {
        setPasswordValid(false);
      } else {
        setPasswordValid(true);
      }
    }

    passwordConfirmChangeHandler();
  };

  const passwordConfirmChangeHandler = () => {
    const userPassword = userPasswordRef.current.value;
    const userPasswordConfirm = userPasswordConfirmRef.current.value;

    if (userPassword != userPasswordConfirm || userPassword.length == 0) {
      setPasswordConfirmValid(false);
    } else {
      setPasswordConfirmValid(true);
    }
  };

  const toggleEmailVerificationFormHandler = () => {
    setShowEmailVerificationForm(!showEmailVerificationForm);
  };

  const emailVerificationHandler = async (e) => {
    e.preventDefault();

    const userEmail = userEmailRef.current.value;

    setIsLoading(true);
    try {
      const res = await fetch(`${serverName}/api/send-verification-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userEmail }),
      });

      const data = await res.json();

      setIsLoading(false);
      setShowEmailVerificationForm(true);
    } catch (err) {
      console.error("Error sending an api POST request");
      setIsLoading(false);
    }
  };

  const registrationHandler = async () => {
    toggleEmailVerificationFormHandler();

    if (formValid) {
      const username = usernameRef.current.value;
      const email = userEmailRef.current.value;
      const password = userPasswordRef.current.value;
      const dateOfBirth = new Date(userDOBRef.current.value).toISOString();
      const gender = userGenderRef.current.value;
      const city = userCityRef.current.value;
      const region = userRegionRef.current.value;
      const isAdmin = userEmailRef.current.value.trim() === "admin@gmail.com";
      const isVip = false;
      const createdAt = new Date().toISOString();
      const profilePicture = null;
      const photos = null;

      const userObj = {
        username,
        email,
        password,
        dateOfBirth,
        gender,
        city,
        region,
        isAdmin,
        isVip,
        createdAt,
        profilePicture,
        photos,
      };

      const res = await fetch(`${serverName}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userObj }),
      });

      const data = await res.json();

      if (data.ok) {
        console.log(data.message);
        props.onHideRegistrationForm();
        dispatch(setUser(data.user));

        const res = await fetch(`${serverName}/api/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userEmail: userObj.email,
            userPassword: userObj.password,
          }),
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();

          if (data.loggedIn) {
            dispatch(logIn());
            navigate("/profile");
          }
        }
      } else {
        dispatch(setError(data.message));
        console.error(data.message);
      }
    } else {
      dispatch(setError("Form is not valid"));
      console.error("Form is not valid");
    }
  };

  return (
    <>
      {showEmailVerificationForm && (
        <EmailVerificationForm
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            zIndex: "13",
            width: "32rem",
            transform: "translate(-50%, -50%)",
          }}
          onHideEmailVerificationForm={toggleEmailVerificationFormHandler}
          onSubmitVerificationForm={registrationHandler}
        />
      )}

      <Form
        style={props.style}
        onSubmit={emailVerificationHandler}
        onHideEmailVerificationForm={toggleEmailVerificationFormHandler}
        className="reg-form"
      >
        {isLoading && (
          <Spinner
            animation="border"
            variant="light"
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
        )}
        <Card
          className="bg-white p-4 d-flex flex-column gap-3"
          style={{
            visibility:
              showEmailVerificationForm || isLoading ? "hidden" : "visible",
          }}
        >
          <div className="d-flex justify-content-between">
            <Card.Title className="">Регистрация</Card.Title>
            <button
              type="button"
              className="btn-close"
              onClick={props.onHideRegistrationForm}
            />
          </div>

          <div className="name-email d-flex gap-5 justify-content-between">
            <Form.Group controlId="formBasicUsernameReg">
              <Form.Label>Имя:</Form.Label>
              <Form.Control
                type="text"
                name="userName"
                ref={usernameRef}
                className={nameClass}
                onClick={setNameTouched.bind(null, true)}
                onChange={changeNameHandler}
              />
            </Form.Group>

            <Form.Group controlId="formBasicEmailReg">
              <Form.Label>E-mail:</Form.Label>
              <Form.Control
                type="email"
                name="userEmail"
                ref={userEmailRef}
                className={emailClass}
                onClick={setEmailTouched.bind(null, true)}
                onChange={changeEmailHandler}
              />
            </Form.Group>
          </div>

          <div className="password d-flex gap-5 justify-content-between">
            <Form.Group controlId="formBasicPasswordReg">
              <Form.Label>Пароль:</Form.Label>
              <Form.Control
                type={!showPassword ? "password" : "text"}
                name="userPassword"
                ref={userPasswordRef}
                className={passwordClass}
                onClick={setPasswordTouched.bind(null, true)}
                onChange={passwordChangeHandler}
              />
            </Form.Group>

            <Form.Group controlId="formBasicPasswordConfirmReg">
              <Form.Label>Подтвердите Пароль:</Form.Label>
              <Form.Control
                type={!showPassword ? "password" : "text"}
                name="userPassword"
                ref={userPasswordConfirmRef}
                className={passwordConfirmClass}
                onClick={setPasswordConfirmTouched.bind(null, true)}
                onChange={passwordConfirmChangeHandler}
              />
            </Form.Group>
          </div>

          <Form.Check
            label={!showPassword ? "Показать пароль" : "Скрыть пароль"}
            onClick={setShowPassword.bind(null, !showPassword)}
            value="showPassword"
          />

          <div className="text-muted">
            <span>Пароль должен содержать: </span>

            <ul>
              <li>Минимум 8 cимволов</li>
              <li>Только латинские символы</li>
              <li>Минимум одну заглавную букву</li>

              <li>Минимум одну строчную букву</li>
              <li>Минимум одну цифру</li>
              <li>Минимум один из символов: *.!@$%^&(){}[]:;,.?/~_+-=|\</li>
            </ul>
          </div>

          <div className="d-flex gap-5">
            <Form.Group controlId="formBasicDOBReg">
              <Form.Label>Дата Рождения:</Form.Label>
              <Form.Control
                type="date"
                name="userDOB"
                ref={userDOBRef}
                value={userDate}
                onChange={changeDateHandler}
              />
            </Form.Group>

            <Form.Group controlId="formBasicGenderReg" className="">
              <Form.Label>Пол:</Form.Label>

              <Form.Select name="userGender" ref={userGenderRef}>
                <option value="male">М</option>
                <option value="female">Ж</option>
              </Form.Select>
            </Form.Group>
          </div>

          <Form.Group controlId="formBasicRegionReg">
            <Form.Label>Регион:</Form.Label>
            <Form.Select
              name="userRegion"
              onChange={changeRegionHandler}
              ref={userRegionRef}
            >
              {regions.map((region, i) => (
                <option value={region} key={i}>
                  {region}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group controlId="formBasicCityReg">
            <Form.Label>Город:</Form.Label>
            <Form.Select
              name="userCity"
              style={{ width: "20rem" }}
              ref={userCityRef}
            >
              {citiesRegions.map((obj, i) => {
                if (obj.region === regionState) {
                  return (
                    <option value={obj.city} key={i}>
                      {obj.city}
                    </option>
                  );
                }
              })}
            </Form.Select>
          </Form.Group>

          <Button
            variant="success"
            type="submit"
            className="mt-4"
            disabled={!formValid}
          >
            Зарегистрироваться
          </Button>
        </Card>
      </Form>
    </>
  );
};

export default RegistrationForm;
