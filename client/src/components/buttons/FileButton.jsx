const FileButton = (props) => {
  return (
    <label className={props.className} htmlFor={props.id} style={props.style}>
      <input
        type="file"
        name={props.name}
        variant="secondary"
        className="d-none"
        onChange={props.onChange}
        id={props.id}
      />
      {props.children}
    </label>
  );
};

export default FileButton;
