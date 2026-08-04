import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { initializeEmbeddings } from "./services/embeddingLoader";
import Welcome from "./pages/welcome";
import Profile from "./pages/Signup";
import Home from "./pages/Home";
import Login from "./pages/login";
import "./App.css";
import Evaluation from "./pages/evaluation";

function App() {
  useEffect(() => {
    initializeEmbeddings();
  }, []);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />

        <Route path="/Signup" element={<Profile />} />

        <Route path="/home" element={<Home />} />

        <Route path="/login" element={<Login />} />
        <Route path="/evaluation" element={<Evaluation />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
