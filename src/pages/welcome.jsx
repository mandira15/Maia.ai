import "./welcome.css";
import { useNavigate } from "react-router-dom";

function Welcome() {

    const navigate = useNavigate();

    return (

        <div className="welcome-container">

            <div className="welcome-card">

                <div className="logo">
                    🌸
                </div>

                <h1 className="app-name">
                    Maia
                </h1>

                <p className="tagline">
                    Nayi Mom ki nayi duniya
                    <br />
                    Ek jagah par — Maia ke saath
                </p>

                <div className="language-section">

                    <label>
                        Select Language
                    </label>

                    <select defaultValue="English">
                        <option>English</option>
                        <option>हिंदी</option>
                    </select>

                </div>

                <button
                    className="start-btn"
                    onClick={() => navigate("/signup")}
                >
                    Create Account 🌸 
                </button>

                <div className="divider">
                    <span>OR</span>
                </div>

                <button
                    className="login-btn"
                    onClick={() => navigate("/login")}
                >
                    Login 🩷
                </button>

            </div>

        </div>

    );

}

export default Welcome;