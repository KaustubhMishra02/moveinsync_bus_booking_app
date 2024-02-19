import React, { useState, useCallback } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Redirect,
  Switch,
} from "react-router-dom";

import Header from "./components/Header";
import LogIn from "./components/Login";
import SignUp from "./components/Signup";
import BrowseBuses from "./components/BrowseBuses";
import BusCard from "./components/BusCard";
import { AuthContext } from "./context/auth-context";

const App = () => {
  const [token,setToken] = useState(false);
  const [userId, setUserId] = useState(false);

  const login = useCallback(() => {
    setToken(token);
    setUserId(userId);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUserId(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ token: token,userId:userId, login: login, logout: logout }}
    >
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<LogIn />} />{" "}
          <Route path="/signup" element={<SignUp />} />{" "}
          <Route path="/browseBuses" element={<BrowseBuses />} />{" "}
          <Route path="/browseBusCards" element={<BusCard />} />{" "}
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
};
export default App;
