import { BrowserRouter, Routes, Route } from "react-router-dom";

import Welcome from "./pages/welcome";
import Profile from "./pages/Signup";
import Home from "./pages/Home";
import Login from "./pages/login";

import "./App.css";

function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Welcome />} />

        <Route path="/Signup" element={<Profile />} />

        <Route path="/home" element={<Home />} />

        <Route path="/login" element={<Login />} />


      </Routes>

    </BrowserRouter>

  );

}

export default App;