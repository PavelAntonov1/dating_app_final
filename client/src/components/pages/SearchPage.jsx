import {
  Button,
  FormControl,
  InputGroup,
  Container,
  Spinner,
} from "react-bootstrap";
import { FaDizzy, FaSearch } from "react-icons/fa";
import SearchForm from "../forms/SearchForm";
import DisplayUsers from "../users/DisplayUsers";
import Paginate from "react-paginate";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import User from "../users/User";
import "./SearchPage.css";
import { useSelector } from "react-redux";
import { json } from "react-router-dom";

const SearchPage = (props) => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [numPages, setNumPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isFiltered, setIsFiltered] = useState(props.filter != null);
  const username = useSelector((state) => state.user.user?.username ?? "guest");

  const [options, setOptions] = useState(
    props.filter ?? {
      username: null,
      ageMin: 0,
      ageMax: 100,
      region: null,
      city: null,
      hasPhoto: false,
      gender: null,
    }
  );

  const filterUsersHandler = (options) => {
    setIsLoading(true);
    fetch(`http://localhost:3001/api/users/filtered?page=${page + 1}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Cookies.get("jwt")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ options }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);

        if (data.ok) {
          setUsers(data.users.docs);
          setNumPages(data.numPages);
          setIsFiltered(true);
          setOptions(options);
        }
      })
      .catch((err) =>
        console.error(`Error while fetching the paginated users: ${err}`)
      )
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    setIsLoading(true);

    !isFiltered &&
      fetch(`http://localhost:3001/api/users?page=${page + 1}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("jwt")}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);

          if (data.ok) {
            setUsers(data.users.docs);
            setNumPages(data.numPages);
          }
        })
        .catch((err) =>
          console.error(`Error while fetching the paginated users: ${err}`)
        )
        .finally(() => setIsLoading(false));

    isFiltered && filterUsersHandler(options);
  }, [page]);

  return (
    <Container className="parent-container d-flex flex-column my-4 align-items-stretch justify-content-start">
      <div className="search-page-container d-flex flex-row gap-5 w-100 h-100">
        <SearchForm
          style={{ width: "30rem" }}
          className="search-form"
          options={options}
          onFilterUsers={filterUsersHandler}
          filter={props.filter}
        />

        {!isLoading && (
          <DisplayUsers>
            {!users ||
              (users.length === 0 && (
                <p className="text-center text-muted">
                  <FaDizzy style={{ fontSize: "2.5rem" }} className="mr-1" />{" "}
                  Пользователей не найдено.
                </p>
              ))}
            {users.map((user) => {
              if (user.username !== username) {
                return (
                  <User
                    key={user._id}
                    username={user.username}
                    dateOfBirth={user.dateOfBirth}
                    profilePicture={user.profilePicture}
                    gender={user.gender}
                    city={user.city}
                    region={user.region}
                    className="w-100"
                    style={{ cursor: "pointer" }}
                    long={true}
                  />
                );
              }
            })}
            <div />
          </DisplayUsers>
        )}

        {isLoading && (
          <div
            className="d-flex w-100 justify-content-center align-items-center"
            style={{ height: "100vh" }}
          >
            <Spinner
              animation="border"
              variant="primary"
              role="status"
              aria-hidden="true"
              as="span"
              style={{
                width: "5rem",
                height: "5rem",
              }}
            />
          </div>
        )}
      </div>

      {numPages > 1 && (
        <Paginate
          pageCount={numPages}
          pageRangeDisplayed={5}
          marginPagesDisplayed={2}
          onPageChange={({ selected }) => setPage(selected)}
          previousLabel={"<"}
          nextLabel={">"}
          containerClassName="pagination justify-content-center"
          pageClassName="page-item"
          pageLinkClassName="page-link"
          activeClassName="active"
          previousClassName="page-item"
          nextClassName="page-item"
          previousLinkClassName="page-link"
          nextLinkClassName="page-link"
        />
      )}
    </Container>
  );
};

export default SearchPage;
