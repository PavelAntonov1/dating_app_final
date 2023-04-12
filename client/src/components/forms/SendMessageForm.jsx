import React from "react";
import { Form, Card, Button, Image, Alert } from "react-bootstrap";
import { FaFileImage } from "react-icons/fa";
import FileButton from "../buttons/FileButton";

const SendMessageForm = React.forwardRef((props, ref) => {
  console.log(props.fileURL);

  return (
    <Form onSubmit={props.onSubmit}>
      <Card>
        {(props.fileURL || props.error) && (
          <Card.Header className="w-100 d-flex flex-column p-3">
            <p className="text-muted">
              Прикрепленное {props.isImage ? "Фото" : "Видео"}:
            </p>
            {!props.error && props.isImage && (
              <Image
                src={props.fileURL}
                alt="image-attached"
                style={{
                  width: "15rem",
                  height: "15rem",
                  objectFit: "cover",
                }}
                className="rounded"
              />
            )}

            {!props.error && !props.isImage && (
              <video controls style={{ width: "30rem" }} className="rounded">
                <source src={props.fileURL} type="video/mp4" />
              </video>
            )}

            {props.error && <Alert variant="danger">{props.error}</Alert>}
          </Card.Header>
        )}

        <Form.Group className="d-flex gap-3 w-100 p-4">
          <Form.Control
            type="text"
            value={typeof props.inputValue === 'object' ? "" : props.inputValue}
            ref={ref}
            onChange={props.onChange}
          />
          <FileButton
            name="message-photo"
            id="message-photo"
            className="btn-secondary p-2 rounded"
            style={{ fontSize: "1.5rem", cursor: "pointer" }}
            onChange={(e) => props.onChangeFile(e)}
          >
            <FaFileImage />
          </FileButton>
          <Button variant="primary" type="submit">
            Отправить
          </Button>
        </Form.Group>
      </Card>
    </Form>
  );
});

export default SendMessageForm;
