import { Alert, Button, Card, Form } from "react-bootstrap";
import { useRef, useState } from "react";
import citiesRegions from "../../data/citiesRegions.json";

const regions = [...new Set(citiesRegions.map((obj) => obj.region))];

const AdditionalInfoForm = (props) => {
  const additionalGenderRef = useRef();
  const additionalDOBRef = useRef();
  const additionalEmailRef = useRef();
  const additionalRegionRef = useRef();
  const additionalCityRef = useRef();

  const [regionState, setRegion] = useState("Москва и Московская обл.");

  const [error, setError] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const changeRegionHandler = (e) => {
    setRegion(e.target.value);
  };

  const addUserInfoHandler = (e) => {
    e.preventDefault();
    // add email handling...

    const infoObj = {
      region: additionalRegionRef.current.value,
      city: additionalCityRef.current.value,
    };

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

        <p className="text-muted mb-2">
          Пожалуйста, укажите дополнительную информацию о себе:
        </p>

        {(props.region || props.city) && (
          <Form.Group controlId="fromAdditionalRegionReg" className="mb-2">
            <Form.Label>Регион:</Form.Label>
            <Form.Select
              name="additionalRegion"
              onChange={changeRegionHandler}
              ref={additionalRegionRef}
            >
              {regions.map((region, i) => (
                <option value={region} key={i}>
                  {region}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        )}

        {props.city && (
          <Form.Group controlId="formAdditionalCityReg" className="mb-2">
            <Form.Label>Город:</Form.Label>
            <Form.Select
              name="additionalCity"
              style={{ width: "20rem" }}
              ref={additionalCityRef}
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
        )}

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
