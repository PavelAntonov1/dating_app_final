const Overlay = (props) => {
  return (
    <div
      style={{
        position: "fixed",
        width: "100vw",
        height: "100vh",
        backgroundColor: props.color,
        zIndex: "10",
      }}
    ></div>
  );
};

export default Overlay;
