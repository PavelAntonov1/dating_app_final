import { Card, Button, Form } from "react-bootstrap";
import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import Cookies from "js-cookie";
import { useDispatch } from "react-redux";
import { setUser } from "../../state/userActions.js";

const AboutUser = (props) => {
  const dispatch = useDispatch();

  const [isEditing, setIsEditing] = useState(false);

  const [info, setInfo] = useState(props.userInfo ?? "");

  const [height, setHeight] = useState(props.user.height);
  const [weight, setWeight] = useState(props.user.weight);

  const [bodyType, setBodyType] = useState(props.user.bodyType);
  const [hairColor, setHairColor] = useState(props.user.hairColor);
  const [financialStatus, setFinancialStatus] = useState(
    props.user.financialStatus
  );

  const [additionalInfo, setAdditionalInfo] = useState(
    props.user.additionalInfo
  );

  useEffect(() => {
    setHeight(props.user.height);
    setWeight(props.user.weight);

    setBodyType(props.user.bodyType);
    setHairColor(props.user.hairColor);
    setFinancialStatus(props.user.financialStatus);

    setAdditionalInfo(props.user.additionalInfo);
  }, [props.user]);

  const heightRef = useRef();
  const weightRef = useRef();

  const params = useParams();

  const submitInfoHandler = async (e) => {
    e.preventDefault();

    const height = +heightRef.current.value;
    const weight = +weightRef.current.value;

    const userInfo = {
      height,
      weight,
      bodyType,
      hairColor,
      financialStatus,
      additionalInfo,
    };

    const res = await fetch(
      `https://flirt-dating.herokuapp.com/api/users/${props.user.username}/info`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Cookies.get("jwt")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userInfoObj: userInfo }),
      }
    );

    const data = await res.json();

    console.log(data);

    if (data.ok) {
      dispatch(setUser({ ...props.user, ...userInfo }));
    }

    setIsEditing(false);
  };

  return (
    <Card className="w-100">
      <Card.Header as="h3" className="p-4">
        {props.isClient ? "Обо Мне" : `О ${params.username}`}
      </Card.Header>

      <Card.Body className="p-4">
        {(!isEditing || !props.isClient) && (
          <Form className="text-right" onSubmit={submitInfoHandler}>
            <div className="d-flex gap-4 flex-wrap">
              <div className="d-flex gap-3 text-left height-weight">
                <Form.Group controlId="height">
                  <Form.Label className="font-weight-bold">Рост:</Form.Label>
                  <Form.Control
                    type="number"
                    style={{ width: "5rem" }}
                    ref={heightRef}
                    onChange={(e) => setHeight(e.target.value)}
                    value={height || ""}
                  />
                </Form.Group>

                <Form.Group controlId="weight">
                  <Form.Label className="font-weight-bold">Вес:</Form.Label>
                  <Form.Control
                    type="number"
                    style={{ width: "5rem" }}
                    ref={weightRef}
                    onChange={(e) => setWeight(e.target.value)}
                    value={weight || ""}
                  />
                </Form.Group>
              </div>

              <div>
                <div className="d-flex text-left user-data gap-4 w-100">
                  <Form.Group controlId="bodyType">
                    <Form.Label className="font-weight-bold">
                      Телосложение:
                    </Form.Label>
                    <div>
                      <Form.Check
                        label="Худощавое"
                        value="0"
                        name="body-type"
                        type="radio"
                        checked={bodyType === 0}
                        onChange={() => setBodyType(0)}
                      />
                      <Form.Check
                        label="Обычное"
                        value="1"
                        name="body-type"
                        type="radio"
                        onChange={() => setBodyType(1)}
                        checked={bodyType === 1}
                      />
                      <Form.Check
                        label="Спортивное"
                        value="2"
                        name="body-type"
                        type="radio"
                        onChange={() => setBodyType(2)}
                        checked={bodyType === 2}
                      />
                      <Form.Check
                        label="Мускулистое"
                        value="3"
                        name="body-type"
                        type="radio"
                        onChange={() => setBodyType(3)}
                        checked={bodyType === 3}
                      />
                      <Form.Check
                        label="Плотное"
                        value="4"
                        name="body-type"
                        type="radio"
                        onChange={() => setBodyType(4)}
                        checked={bodyType === 4}
                      />
                      <Form.Check
                        label="Полное"
                        value="5"
                        name="body-type"
                        type="radio"
                        onChange={() => setBodyType(5)}
                        checked={bodyType === 5}
                      />
                    </div>
                  </Form.Group>

                  <Form.Group controlId="hairColor">
                    <Form.Label className="font-weight-bold">
                      Цвет Волос:
                    </Form.Label>
                    <div>
                      <Form.Check
                        label="Светлый"
                        value="0"
                        type="radio"
                        name="hair-color"
                        onChange={() => setHairColor(0)}
                        checked={hairColor === 0}
                      />
                      <Form.Check
                        label="Тёмный"
                        value="1"
                        name="hair-color"
                        type="radio"
                        onChange={() => setHairColor(1)}
                        checked={hairColor === 1}
                      />
                      <Form.Check
                        label="Рыжий"
                        value="2"
                        name="hair-color"
                        type="radio"
                        onChange={() => setHairColor(2)}
                        checked={hairColor === 2}
                      />
                      <Form.Check
                        label="Русый"
                        value="3"
                        name="hair-color"
                        type="radio"
                        onChange={() => setHairColor(3)}
                        checked={hairColor === 3}
                      />
                      <Form.Check
                        label="Яркие"
                        value="4"
                        name="hair-color"
                        type="radio"
                        onChange={() => setHairColor(4)}
                        checked={hairColor === 4}
                      />
                      <Form.Check
                        label="Седые"
                        value="5"
                        name="hair-color"
                        type="radio"
                        onChange={() => setHairColor(5)}
                        checked={hairColor === 5}
                      />
                      <Form.Check
                        type="radio"
                        label="Нет Волос"
                        value="6"
                        name="hair-color"
                        onChange={() => setHairColor(6)}
                        checked={hairColor === 6}
                      />
                    </div>
                  </Form.Group>

                  <Form.Group controlId="financialStatus">
                    <Form.Label className="font-weight-bold">
                      Материальное Положение:
                    </Form.Label>
                    <Form.Check
                      label="Непостоянные Зарaботки"
                      value="0"
                      name="financial-status"
                      type="radio"
                      onChange={() => setFinancialStatus(0)}
                      checked={financialStatus === 0}
                    />
                    <Form.Check
                      label="Постоянный небольшой доход"
                      value="1"
                      name="financial-status"
                      type="radio"
                      onChange={() => setFinancialStatus(1)}
                      checked={financialStatus === 1}
                    />
                    <Form.Check
                      label="Стабильный средний доход"
                      value="2"
                      name="financial-status"
                      type="radio"
                      onChange={() => setFinancialStatus(2)}
                      checked={financialStatus === 2}
                    />
                    <Form.Check
                      label="Высокий Заработок"
                      type="radio"
                      value="3"
                      name="financial-status"
                      onChange={() => setFinancialStatus(3)}
                      checked={financialStatus === 3}
                    />
                  </Form.Group>
                </div>

                <Form.Group controlId="additionalInfo" className="text-left">
                  <Form.Label className="font-weight-bold">
                    Доп. Информация:
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows="5"
                    onChange={(e) => {
                      setAdditionalInfo(e.target.value);
                    }}
                    value={additionalInfo || ""}
                  />
                </Form.Group>
              </div>
            </div>
          </Form>
        )}

        {isEditing && (
          <Form className="text-right" onSubmit={submitInfoHandler}>
            <div className="d-flex gap-4 flex-wrap">
              <div className="d-flex gap-3 text-left height-weight">
                <Form.Group controlId="height-e">
                  <Form.Label className="font-weight-bold">Рост:</Form.Label>
                  <Form.Control
                    type="number"
                    style={{ width: "5rem" }}
                    ref={heightRef}
                    onChange={(e) => setHeight(e.target.value)}
                  />
                </Form.Group>

                <Form.Group controlId="weight-e">
                  <Form.Label className="font-weight-bold">Вес:</Form.Label>
                  <Form.Control
                    type="number"
                    style={{ width: "5rem" }}
                    ref={weightRef}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </Form.Group>
              </div>

              <div>
                <div className="d-flex text-left gap-4 user-data w-100">
                  <Form.Group controlId="bodyType-e">
                    <Form.Label className="font-weight-bold">
                      Телосложение:
                    </Form.Label>
                    <div>
                      <Form.Check
                        label="Худощавое"
                        value="0"
                        name="body-type"
                        type="radio"
                        onChange={() => setBodyType(0)}
                      />
                      <Form.Check
                        label="Обычное"
                        value="1"
                        name="body-type"
                        type="radio"
                        onChange={() => setBodyType(1)}
                      />
                      <Form.Check
                        label="Спортивное"
                        value="2"
                        name="body-type"
                        type="radio"
                        onChange={() => setBodyType(2)}
                      />
                      <Form.Check
                        label="Мускулистое"
                        value="3"
                        name="body-type"
                        type="radio"
                        onChange={() => setBodyType(3)}
                      />
                      <Form.Check
                        label="Плотное"
                        value="4"
                        name="body-type"
                        type="radio"
                        onChange={() => setBodyType(4)}
                      />
                      <Form.Check
                        label="Полное"
                        value="5"
                        name="body-type"
                        type="radio"
                        onChange={() => setBodyType(5)}
                      />
                    </div>
                  </Form.Group>

                  <Form.Group controlId="hairColor-e">
                    <Form.Label className="font-weight-bold">
                      Цвет Волос:
                    </Form.Label>
                    <div>
                      <Form.Check
                        label="Светлый"
                        value="0"
                        type="radio"
                        name="hair-color"
                        onChange={() => setHairColor(0)}
                      />
                      <Form.Check
                        label="Тёмный"
                        value="1"
                        name="hair-color"
                        type="radio"
                        onChange={() => setHairColor(1)}
                      />
                      <Form.Check
                        label="Рыжий"
                        value="2"
                        name="hair-color"
                        type="radio"
                        onChange={() => setHairColor(2)}
                      />
                      <Form.Check
                        label="Русый"
                        value="3"
                        name="hair-color"
                        type="radio"
                        onChange={() => setHairColor(3)}
                      />
                      <Form.Check
                        label="Яркие"
                        value="4"
                        name="hair-color"
                        type="radio"
                        onChange={() => setHairColor(4)}
                      />
                      <Form.Check
                        label="Седые"
                        value="5"
                        name="hair-color"
                        type="radio"
                        onChange={() => setHairColor(5)}
                      />
                      <Form.Check
                        type="radio"
                        label="Нет Волос"
                        value="6"
                        name="hair-color"
                        onChange={() => setHairColor(6)}
                      />
                    </div>
                  </Form.Group>

                  <Form.Group controlId="financialStatus-e">
                    <Form.Label className="font-weight-bold">
                      Материальное Положение:
                    </Form.Label>
                    <Form.Check
                      label="Непостоянные Зарaботки"
                      value="0"
                      name="financial-status"
                      type="radio"
                      onChange={() => setFinancialStatus(0)}
                    />
                    <Form.Check
                      label="Постоянный небольшой доход"
                      value="1"
                      name="financial-status"
                      type="radio"
                      onChange={() => setFinancialStatus(1)}
                    />
                    <Form.Check
                      label="Стабильный средний доход"
                      value="2"
                      name="financial-status"
                      type="radio"
                      onChange={() => setFinancialStatus(2)}
                    />
                    <Form.Check
                      label="Высокий Заработок"
                      type="radio"
                      value="3"
                      name="financial-status"
                      onChange={() => setFinancialStatus(3)}
                    />
                  </Form.Group>
                </div>

                <Form.Group controlId="additionalInfo-e" className="text-left">
                  <Form.Label className="font-weight-bold">
                    Доп. Информация:
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows="5"
                    onChange={(e) => {
                      setAdditionalInfo(e.target.value);
                    }}
                  />
                </Form.Group>
              </div>
            </div>

            {props.isClient && (
              <Button type="submit" variant="primary" className="mt-3">
                Подтвердить
              </Button>
            )}
          </Form>
        )}
      </Card.Body>

      {props.isClient && !isEditing && (
        <Card.Footer className="p-4 text-right">
          <Button variant="primary" onClick={setIsEditing.bind(null, true)}>
            Редактировать
          </Button>
        </Card.Footer>
      )}
    </Card>
  );
};

export default AboutUser;
