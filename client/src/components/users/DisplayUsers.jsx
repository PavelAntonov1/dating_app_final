const DisplayUsers = (props) => {
    return <div className="d-flex flex-column gap-3 w-100">
        {props.children}
    </div>;
}

export default DisplayUsers;