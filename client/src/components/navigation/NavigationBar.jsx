import { Navbar, Container, Nav, Badge } from "react-bootstrap";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";

const NavigationBar = (props) => {
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
  console.log(isLoggedIn);

  return (
    <Navbar bg="white" expand="lg" className="navbar-dating shadow-sm">
      <Container>
        <Navbar.Brand
          href="#home"
          className="mr-auto"
          style={{ margin: 0, padding: 0 }}
        >
          App
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="navbar" />

        <Navbar.Collapse id="navbar" className="ml-auto">
          <Nav className="ml-auto">
            <Nav.Link>
              <NavLink to="homepage" className="text-dark">
                Главная
              </NavLink>
            </Nav.Link>
            <Nav.Link>
              <NavLink to="search" className="text-dark">
                Поиск
              </NavLink>
            </Nav.Link>

            {isLoggedIn && (
              <Nav.Link>
                <NavLink to="dialogues/select" className="text-dark">
                  Диалоги
                </NavLink>
              </Nav.Link>
            )}

            {isLoggedIn && (
              <Nav.Link>
                <NavLink to="profile" className="text-dark">
                  Профиль
                </NavLink>
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
