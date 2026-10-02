import "./login.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../api/api";
import { saveUser } from "../services/cacheService";
import { restoreAccountDashboardData, clearAccountLocalData } from "../services/syncService";

function Login() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        phoneNumber: "",
        password: ""
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleLogin = async (e) => {

        e.preventDefault();

        try {

            const response = await api.post("/auth/login", {
                phoneNumber: formData.phoneNumber,
                password: formData.password
            });

            const newToken = response.data.token;
            const loggedInUser = response.data.user;
            const previousPhone = localStorage.getItem("currentUserPhone");

            // If a different user was logged in previously on this device, clear local account cache
            if (previousPhone && previousPhone !== formData.phoneNumber) {
                await clearAccountLocalData();
            }

            localStorage.setItem("token", newToken);
            localStorage.setItem("currentUserPhone", formData.phoneNumber);
            if (loggedInUser?.id) {
                localStorage.setItem("currentUserId", String(loggedInUser.id));
            }

            if (loggedInUser) {
                await saveUser({
                    ...loggedInUser,
                    pregnancyWeekRecordedAt: Date.now(),
                });
            }

            // Restore account data from backend for this user
            await restoreAccountDashboardData(loggedInUser?.pregnancyWeek);

            alert(response.data.message);

            navigate("/home");

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Login Failed"
            );

        }


    };

    return (

        <div className="login-container">

            <div className="login-card">

                <h1>Welcome Back 💜</h1>

                <p className="subtitle">
                    Continue your maternity journey with Maia.
                </p>

                <form onSubmit={handleLogin}>

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

                    <button
                        type="submit"
                        className="login-btn"
                    >
                        Login
                    </button>

                </form>

                <p className="signup-link">
                    New to Maia?{" "}
                    <Link to="/signup">
                        Create Account
                    </Link>
                </p>

            </div>

        </div>

    );

}

export default Login;