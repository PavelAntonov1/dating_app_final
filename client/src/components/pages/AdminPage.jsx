import { Container, Card, Image } from "react-bootstrap";
import ControlBotsForm from "../forms/ControlBotsForm.jsx";
import { useSelector } from "react-redux";
import UserProfileCard from "../users/UserProfileCard.jsx";
import DeleteUsersForm from "../forms/DeleteUserForm.jsx";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import "./AdminPage.css";
import { serverName } from "../../config.js";

const AdminPage = () => {
  const user = useSelector((state) => state.user.user);

  const [totalUsers, setTotalUser] = useState(0);

  const [maleRealUsers, setMaleRealUsers] = useState(0);
  const [femaleRealUsers, setFemaleRealUsers] = useState(0);

  const [maleBots, setMaleBots] = useState(0);
  const [femaleBots, setFemaleBots] = useState(0);

  useEffect(() => {
    fetch("${serverName}/api/users/real", {
      headers: {
        Authorization: `Bearer ${Cookies.get("jwt")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setMaleRealUsers(data.countMales);
          setFemaleRealUsers(data.countFemales);
        }
      });
  }, []);

  useEffect(() => {
    fetch("${serverName}/api/users/bots", {
      headers: {
        Authorization: `Bearer ${Cookies.get("jwt")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setMaleBots(data.countMales);
          setFemaleBots(data.countFemales);
        }
      });
  }, []);

  return (
    <Container className="admin-page-container d-flex flex-column gap-4 w-100 my-4 align-items-stretch justify-content-start">
      <UserProfileCard user={user} isClient={true} />

      <Card className="users-info w-100">
        <Card.Header className="p-4">
          <h4>Информация о пользователях</h4>
        </Card.Header>

        <Card.Body className="users-info d-flex gap-4 p-4 justify-content-center align-items-center">
          <Card className="numUsers d-flex p-4 flex-column gap-2 justify-content-center align-items-center">
            <Card.Title>Всего</Card.Title>
            <p className="display-6">
              {femaleBots + femaleRealUsers + maleBots + maleRealUsers}
            </p>
          </Card>

          <Card className="activeUsers d-flex p-4 flex-column gap-2 justify-content-center align-items-center">
            <Card.Title>Сейчас в сети</Card.Title>
            <p className="display-6">0</p>
          </Card>

          <Card className="botUsers d-flex p-4 flex-column gap-2 justify-content-center align-items-center">
            <Card.Title>Ботов</Card.Title>
            <p className="display-6">{femaleBots + maleBots}</p>

            <div className="d-flex gap-3">
              <Card className="maleBots d-flex flex-column gap-1 p-2 justify-content-center align-items-center">
                <span className="text-muted">Муж</span>
                <span>{maleBots}</span>
              </Card>

              <Card className="femaleBots d-flex flex-column gap-1 p-2 justify-content-center align-items-center">
                <span className="text-muted">Жен</span>
                <span>{femaleBots}</span>
              </Card>
            </div>
          </Card>

          <Card className="realUsers d-flex p-4 flex-column gap-2 justify-content-center align-items-center">
            <Card.Title>Реальных людей</Card.Title>
            <p className="display-6">{femaleRealUsers + maleRealUsers}</p>

            <div className="d-flex gap-3">
              <Card className="maleUsers d-flex flex-column gap-1 p-2 justify-content-center align-items-center">
                <span className="text-muted">Муж</span>
                <span>{maleRealUsers}</span>
              </Card>

              <Card className="femaleUsers d-flex flex-column gap-1 p-2 justify-content-center align-items-center">
                <span className="text-muted">Жен</span>
                <span>{femaleRealUsers}</span>
              </Card>
            </div>
          </Card>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header className="p-4">
          <h4>Управление пользователями</h4>
        </Card.Header>
        <Card.Body className="control-users p-4 d-flex gap-4 justify-content-center align-items-center">
          <ControlBotsForm add={true} className="add-bots-form" />
          <ControlBotsForm add={false} className="remove-bots-form" />
          <DeleteUsersForm />
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminPage;
