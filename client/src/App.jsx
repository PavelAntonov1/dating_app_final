import { useEffect, useState } from "react";
import HomePage from "./components/pages/HomePage";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useParams,
} from "react-router-dom";
import ProfilePage from "./components/pages/ProfilePage";
import NavigationBar from "./components/navigation/NavigationBar";

import { useSelector, useDispatch } from "react-redux";
import { logIn, setUser, logOut } from "./state/userActions";
import Cookies from "js-cookie";
import ChatPage from "./components/pages/ChatPage";
import SearchPage from "./components/pages/SearchPage";
import AdminPage from "./components/pages/AdminPage";
import { serverName } from "./config";
import "./App.css";

const App = () => {
  const navigate = useNavigate();
  const params = useParams();

  const user = useSelector((state) => state.user.user);

  const dispatch = useDispatch();

  console.log("update");

  useEffect(() => {
    console.log("Updating <App />");

    if (Cookies.get("jwt")) {
      fetch("${serverName}/api/user", {
        headers: {
          Authorization: `Bearer ${Cookies.get("jwt")}`,
        },
      })
        .then((res) => res.json())
        .then((userData) => {
          const { user } = userData;

          if (user != null) {
            dispatch(logIn());
            dispatch(setUser(user));

            if (
              window.location.href.split("/")[
                window.location.href.split("/").length - 1
              ] === "profile" ||
              window.location.href.split("/")[
                window.location.href.split("/").length - 1
              ] === ""
            ) {
              navigate("/profile");
            }

            console.log("User logged in");
          }
        });
    } else {
      console.log("User not logged in");
    }
  }, []);

  const [filter, setFilter] = useState(null);

  return (
    <div className="vh-100">
      <NavigationBar counter={0} className="navbarDating" />
      <Routes>
        <Route path="/" element={<Navigate to="/homepage" />} />
        <Route
          path="/homepage"
          element={<HomePage onSetFilter={(options) => setFilter(options)} />}
        />
        <Route
          path="/profile/:username"
          element={<ProfilePage isClient={false} />}
        />
        <Route
          path="/profile"
          element={
            user?.isAdmin ? <AdminPage /> : <ProfilePage isClient={true} />
          }
        />
        <Route path="/dialogues/:username" element={<ChatPage />} />
        <Route path="/search" element={<SearchPage filter={filter} />} />
      </Routes>
    </div>
  );
};

export default App;
