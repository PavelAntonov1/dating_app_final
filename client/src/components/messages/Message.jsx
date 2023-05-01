import { Card, Image } from "react-bootstrap";

const Message = (props) => {
  const messageDate = new Date(props.createdAt);
  const year = messageDate.getFullYear();
  const month =
    messageDate.getMonth() + 1 <= 9
      ? "0" + (messageDate.getMonth() + 1)
      : messageDate.getMonth() + 1;

  const date =
    messageDate.getDate() + 1 <= 9
      ? "0" + (messageDate.getDate() + 1)
      : messageDate.getDate() + 1;

  const dateStr = `${year}/${month}/${date}`;

  const hours =
    messageDate.getHours() <= 9
      ? "0" + messageDate.getHours() + 1
      : messageDate.getHours();

  const minutes =
    messageDate.getMinutes() <= 9
      ? "0" + messageDate.getMinutes()
      : messageDate.getMinutes();

  const timeStr = `${hours}:${minutes}`;

  return (
    <Card
      className={`message d-inline-block shadow-sm p-3 ${
        props.belongsToUser ? "align-self-end" : "align-self-start"
      } ${props.belongsToUser && "bg-secondary"} ${
        props.belongsToUser && "text-white"
      }`}
    >
      {props.isImage && props.fileURL && (
        <Image src={props.fileURL} className="message-image rounded mb-2" />
      )}

      {!props.isImage && props.fileURL && (
        <video
          controls
          style={{ width: "30rem" }}
          className="message-video rounded"
        >
          <source src={props.fileURL} type="video/mp4" />
        </video>
      )}

      <div className="d-flex flex-column gap-1">
        <Card.Title>{props.text}</Card.Title>
        <div
          className="d-flex w-100 justify-content-between gap-4"
          style={{ fontSize: "0.75rem" }}
        >
          <span>{dateStr}</span>
          <span>{timeStr}</span>
        </div>
      </div>
    </Card>
  );
};

export default Message;
