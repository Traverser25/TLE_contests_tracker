import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/login";
import RegisterPage from "./pages/registeration";
import ContestantDashboardPage from "./pages/ContestantDashboardPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<ContestantDashboardPage />} />
      </Routes>
    </Router>
  );
}

export default App;