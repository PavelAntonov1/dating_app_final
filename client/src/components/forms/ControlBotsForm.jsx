import { Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import { useRef, useState } from "react";
import Cookies from "js-cookie";

const ControlBotsForm = (props) => {
  const quantityMaleRef = useRef();
  const quantityFemaleRef = useRef();

  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState({ success: false, message: null });

  const addBotsHandler = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    const res = await fetch(
      `http://localhost:3001/api/users/generate/${quantityMaleRef.current.value}/${quantityFemaleRef.current.value}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Cookies.get("jwt")}`,
        },
      }
    );

    const data = await res.json();
    setIsLoading(false);

    console.log(data);

    if (data.ok) {
      setFeedback({
        success: true,
        message: `Пользователи были ${props.add ? "добавлены" : "удалены"}`,
      });
    } else {
      setFeedback({
        success: false,
        message: `Не удалось ${
          props.add ? "добавить" : "удалить"
        } пользователей`,
      });
    }

    quantityMaleRef.current.value = quantityFemaleRef.current.value = "";
  };

  const removeBotsHandler = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    const res = await fetch(
      `http://localhost:3001/api/users/delete/${quantityMaleRef.current.value}/${quantityFemaleRef.current.value}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Cookies.get("jwt")}`,
        },
      }
    );

    const data = await res.json();
    setIsLoading(false);

    console.log(data);

    if (data.ok) {
      setFeedback({
        success: true,
        message: `Пользователи были ${props.add ? "добавлены" : "удалены"}`,
      });
    } else {
      setFeedback({
        success: false,
        message: `Не удалось ${
          props.add ? "добавить" : "удалить"
        } пользователей`,
      });
    }

    quantityMaleRef.current.value = quantityFemaleRef.current.value = "";
  };

  return (
    <Form
      style={{ width: "max-content" }}
      onSubmit={props.add ? addBotsHandler : removeBotsHandler}
      className={props.className}
    >
      {!isLoading && (
        <Card className={`d-flex flex-column gap-3 p-4`}>
          <Card.Title>
            {props.add ? "Добавить" : "Удалить"} пользователей (Ботов)
          </Card.Title>

          <div className="d-flex gap-4">
            <Form.Group controlId="numBotsMale">
              <Form.Label>Количество (Муж):</Form.Label>
              <Form.Control type="number" ref={quantityMaleRef}></Form.Control>
            </Form.Group>

            <Form.Group controlId="numBotsFemale">
              <Form.Label>Количество (Жен):</Form.Label>
              <Form.Control
                type="number"
                ref={quantityFemaleRef}
              ></Form.Control>
            </Form.Group>
          </div>

          <Button type="submit" variant={props.add ? "success" : "danger"}>
            {props.add ? "Добавить" : "Удалить"}
          </Button>

          {feedback.message && (
            <Alert variant={feedback.success ? "success" : "danger"}>
              {feedback.message}
            </Alert>
          )}
        </Card>
      )}
      {isLoading && (
        <Card className="d-flex align-items-center justify-content-center p-4 gap-3">
          <p className="text-muted">
            Процедура может занять несколько минут...
          </p>

          <Spinner
            animation="border"
            variant="primary"
            role="status"
            aria-hidden="true"
            as="span"
            style={{
              width: "3rem",
              height: "3rem",
            }}
          />
        </Card>
      )}
    </Form>
  );
};

export default ControlBotsForm;
