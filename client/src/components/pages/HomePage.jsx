import { Card, Container } from "react-bootstrap";
import LoginForm from "../forms/LoginForm";
import SearchForm from "../forms/SearchForm";
import NewUsers from "../users/NewUsers";
import { useState } from "react";
import ReactDOM from "react-dom";
import Overlay from "../overlay/Overlay";
import RegistrationForm from "../forms/RegistrationForm";
import { useSelector } from "react-redux";
import "./HomePage.css";
import { useNavigate } from "react-router-dom";

const HomePage = (props) => {
  const [showRegistration, setShowRegistration] = useState(false);
  const navigate = useNavigate();

  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);

  const registrationShowHandler = () => {
    setShowRegistration((showRegistration) => !showRegistration);
  };

  return (
    <Container className="homepage-container d-flex my-4 align-items-stretch justify-content-start">
      {showRegistration &&
        ReactDOM.createPortal(
          <Overlay color="rgba(0, 0, 0, 0.30)" />,
          document.querySelector("#overlay")
        )}

      {showRegistration && (
        <RegistrationForm
          onHideRegistrationForm={registrationShowHandler}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            zIndex: "11",
            width: "32rem",
            transform: "translate(-50%, -50%)",
          }}
        />
      )}

      <div
        className="search-form-container d-flex flex-column gap-3"
        style={{ width: !isLoggedIn ? "40rem" : "max-content" }}
      >
        {!isLoggedIn && (
          <div className="registration-link">
            <LoginForm />

            <div className="d-flex flex-row mt-1 justify-content-around">
              <span className="text-muted">Нет аккаунта?</span>
              <a
                className="text-muted"
                onClick={registrationShowHandler}
                style={{ cursor: "pointer", textDecoration: "underline" }}
              >
                Регистрация
              </a>
            </div>
          </div>
        )}

        <SearchForm
          className="search-form"
          onPassFilter={(options) => {
            props.onSetFilter(options);
          }}
        />
      </div>

      <div className="text-container d-flex flex-column gap-5 m-5 mt-0 mr-0">
        <Card className="p-4">
          <Card.Title className="display-6">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit
          </Card.Title>
          <hr />
          <p>
            Phasellus non ante elementum, pulvinar nisi at, vestibulum nulla.
            Proin dapibus aliquam sollicitudin. Vivamus metus nibh, efficitur
            sed luctus eget, imperdiet quis mauris. Praesent ac dolor a nisl
            viverra eleifend non nec neque. Ut eget libero in odio tincidunt
            commodo. Duis a fermentum purus, et pulvinar sapien. Praesent tellus
            tortor, sollicitudin at quam eget, finibus dictum erat. Proin
            accumsan tristique ligula at vestibulum. Duis malesuada semper
            condimentum. Nam facilisis felis eget fermentum rhoncus. <br />
            <br />
            Ut sit amet convallis diam, sed pulvinar lorem. Integer nec turpis
            eget sem congue eleifend. Maecenas ex magna, rutrum et tortor
            tincidunt, ultricies consectetur magna. Aliquam erat volutpat.
            Vestibulum ante ipsum primis in faucibus orci luctus et ultrices
            posuere cubilia curae; Suspendisse gravida, est in blandit
            porttitor, odio est scelerisque arcu, in pulvinar nulla purus eu
            justo. Vivamus nunc felis, interdum sit amet ultrices volutpat,
            volutpat sed nisi. Pellentesque habitant morbi tristique senectus et
            netus et malesuada fames ac turpis egestas. Praesent vehicula vel
            odio non elementum. Praesent sollicitudin justo ac tortor egestas
            aliquam sed sit amet ex. Ut et pulvinar nunc. <br />
            <br />
            Etiam ex magna, sagittis in felis non, imperdiet ullamcorper mi.
            Maecenas euismod nulla nulla, non pulvinar erat lacinia ut.
            Vestibulum eget sollicitudin arcu, in malesuada enim. Proin
            vestibulum pharetra est, sed molestie nisi congue id. Suspendisse
            potenti. Donec vel nisl eget risus dapibus malesuada. Etiam nec erat
            non mi gravida auctor. Aliquam metus nunc, pretium id purus et,
            posuere efficitur erat. Donec congue ut turpis ut feugiat. Morbi
            ultricies ultricies nisi, sed rhoncus lorem dignissim a. Donec
            euismod nunc et turpis egestas, vitae ultricies magna hendrerit.
          </p>
        </Card>

        <NewUsers />
      </div>
    </Container>
  );
};

export default HomePage;
