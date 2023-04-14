import { Alert, Button, Card, Form } from "react-bootstrap";
import { useRef, useState } from "react";

const AdditionalInfoForm = (props) => {
  const additionalGenderRef = useRef();
  const additionalDOBRef = useRef();
  const additionalEmailRef = useRef();

  const [error, setError] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const addUserInfoHandler = (e) => {
    e.preventDefault();
    // add email handling...

    const infoObj = {};

    if (props.gender) {
      infoObj.gender = additionalGenderRef.current.value;
    }

    if (props.dateOfBirth) {
      infoObj.dateOfBirth = new Date(additionalDOBRef.current.value);
      infoObj.dateOfBirth.setDate(infoObj.dateOfBirth.getDate() + 1);
    }

    props.onRegisterUser(infoObj);
  };

  return (
    <Form
      style={props.style}
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <Card className="p-4">
        <div className="d-flex justify-content-between">
          <Card.Title>Доп. Информация</Card.Title>
          <button
            type="button"
            className="btn-close"
            onClick={props.onHideAdditionalInfoForm}
          />
        </div>

        <p className="text-muted">
          Пожалуйста, укажите дополнительную информацию о себе:
        </p>

        {props.email && (
          <Form.Group controlId="formAdditionalEmailReg">
            <Form.Label>E-mail:</Form.Label>
            <Form.Control
              type="email"
              name="additionalEmail"
              ref={additionalEmailRef}
            />
          </Form.Group>
        )}

        <div className="d-flex gap-3 mb-3">
          {props.gender && (
            <Form.Group controlId="formAdditionalGenderReg" className="">
              <Form.Label>Пол:</Form.Label>

              <Form.Select name="additionalGender" ref={additionalGenderRef}>
                <option value="male">М</option>
                <option value="female">Ж</option>
              </Form.Select>
            </Form.Group>
          )}

          {props.dateOfBirth && (
            <Form.Group controlId="formAdditionalDOBReg">
              <Form.Label>Дата Рождения:</Form.Label>

              <Form.Control
                type="date"
                name="additionalDOB"
                ref={additionalDOBRef}
                value={date}
                onChange={() => setDate(additionalDOBRef.current.value)}
              />
            </Form.Group>
          )}
        </div>

        <Button variant="success" onClick={addUserInfoHandler} className="mb-3">
          Подтвердить
        </Button>

        {error && <Alert variant="danger">error</Alert>}
      </Card>
    </Form>
  );
};

export default AdditionalInfoForm;
