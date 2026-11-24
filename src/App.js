import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import StudentProfile from "./pages/StudentProfile";
import LibrarianProfile from "./pages/LibrarianProfile";
import "./styles.css";

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/register">Register</Link> |{" "}
        <Link to="/login">Log In</Link> |{" "}
        <Link to="/student-profile">Student Profile</Link> |{" "}
        <Link to="/librarian-profile">Librarian Profile</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/student-profile" element={<StudentProfile />} />
        <Route path="/librarian-profile" element={<LibrarianProfile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;