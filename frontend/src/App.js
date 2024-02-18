// import React, { useState, useEffect, useContext } from "react";
// import {
//   BrowserRouter,
//   Routes,
//   Route,
//   Navigate,
//   useLocation,
//   useHistory,
// } from "react-router-dom";
// import Header from "./components/Header";
// import Login from "./components/Login";
// import Signup from "./components/Signup";
// import BrowseBuses from "./components/BrowseBuses";
// import TicketSummary from "./components/TicketSummary";
// import { AuthContext } from "./context/AuthContext";
// import { API_URL } from "./config"; // Import your API URL from a config file

// function App() {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [user, setUser] = useState(null);
//   const { history } = useHistory();
//   const location = useLocation();

//   // Fetch user data and update login state on app load
//   useEffect(() => {
//     const storedUser = localStorage.getItem("user");
//     const storedToken = localStorage.getItem("token");

//     if (storedUser && storedToken) {
//       setUser(JSON.parse(storedUser));
//       setIsLoggedIn(true);
//       // Refresh tokens if necessary (implement token expiration logic)
//     }
//   }, []);

//   // Handle successful login/signup, storing user data and token
//   const handleLoginSuccess = (userData, token) => {
//     setUser(userData);
//     localStorage.setItem("user", JSON.stringify(userData));
//     localStorage.setItem("token", token);
//     setIsLoggedIn(true);
//     history.push("/"); // Redirect to home page after successful login
//   };

//   // Handle logout, removing user data and token
//   const handleLogout = () => {
//     setUser(null);
//     localStorage.removeItem("user");
//     localStorage.removeItem("token");
//     setIsLoggedIn(false);
//     history.push("/login"); // Redirect to login page after logout
//   };

//   // Protected routes requiring authentication
//   const ProtectedRoute = ({ children }) => {
//     if (!isLoggedIn) {
//       const pathname = location.pathname;
//       const search = location.search;
//       const redirectTo = `${pathname}${search}`; // Preserve query params in redirect
//       return <Navigate to={`/login?redirect=${redirectTo}`} replace />;
//     }

//     return children;
//   };

//   return (
//     <AuthContext.Provider value={{ user, handleLogout }}>
//       <BrowserRouter>
//         <Header isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
//         <Routes>
//           <Route
//             path="/login"
//             element={<Login handleLoginSuccess={handleLoginSuccess} />}
//           />
//           <Route path="/signup" element={<Signup />} />
//           <Route path="/" element={<Navigate to="/buses" replace />} />
//           <Route
//             path="/buses"
//             element={
//               <ProtectedRoute>
//                 <BrowseBuses />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/booking/:busId/:seatNumber"
//             element={
//               <ProtectedRoute>
//                 <BookingSummary />
//               </ProtectedRoute>
//             }
//           />
//           {/* Add additional routes for other components */}
//         </Routes>
//       </BrowserRouter>
//     </AuthContext.Provider>
//   );
// }

// export default App;

// Filename - App.js

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
