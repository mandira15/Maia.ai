import "./Signup.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    pregnancyWeek: "",
    phoneNumber: "",
    emergencyContact: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");

      return;
    }

    try {
      const response = await api.post("/auth/signup", {
        fullName: formData.fullName,
        age: formData.age,
        pregnancyWeek: formData.pregnancyWeek,
        phoneNumber: formData.phoneNumber,
        emergencyContact: formData.emergencyContact,
        password: formData.password,
      });

      localStorage.setItem("token", response.data.token);

      navigate("/home");
    } catch (error) {
      alert(error.response?.data?.message || "Signup failed.");
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h1>Create Your Maia Account 🌸</h1>

        <p className="subtitle">
          Let's begin your personalized maternity journey.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            required
          />

          <input
            type="tel"
            name="phoneNumber"
            placeholder="Phone Number"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <button type="submit" className="continue-btn">
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}

export default Signup;
