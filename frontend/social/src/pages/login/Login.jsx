import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import { extractFormErrors } from "../../utils/error";
import "./login.scss";

const Login = () => {
  const [inputs, setInputs] = useState({
    emailOrUsername: "",
    password: "",
  });
  const [errors, setErrors] = useState({ general: null, fields: {} });
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
    if (errors.fields[name]) {
      setErrors((prev) => ({
        ...prev,
        fields: { ...prev.fields, [name]: null },
      }));
    }
  };
  const { login, guestLogin } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({ general: null, fields: {} });
    setLoading(true);
    try {
      await login(inputs);
      navigate("/");
    } catch (err) {
      setErrors(extractFormErrors(err, "Failed to login"));
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setErrors({ general: null, fields: {} });
    setGuestLoading(true);
    try {
      await guestLogin();
      navigate("/");
    } catch (err) {
      setErrors(extractFormErrors(err, "Failed to login as guest"));
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="card">
        <div className="left">
          <h1>IS Media</h1>
          <p>Connect with friends and the world around you on IS Media</p>
          <span>Don't you have an account?</span>
          <Link to="/register">
            <button>Register</button>
          </Link>
        </div>
        <div className="right">
          <h1>Login</h1>
          <form onSubmit={handleLogin}>
            {errors.general && (
              <div className="form-error-alert">{errors.general}</div>
            )}
            <div className="input-group">
              <input
                type="text"
                placeholder="Email or Username"
                name="emailOrUsername"
                value={inputs.emailOrUsername}
                onChange={handleChange}
              />
              {errors.fields.emailOrUsername && (
                <span className="field-error">
                  {errors.fields.emailOrUsername}
                </span>
              )}
            </div>
            <div className="input-group">
              <input
                type="password"
                placeholder="Password"
                name="password"
                value={inputs.password}
                onChange={handleChange}
              />
              {errors.fields.password && (
                <span className="field-error">{errors.fields.password}</span>
              )}
            </div>
            <button type="submit" disabled={loading || guestLoading}>
              {loading ? "Logging in..." : "Login"}
            </button>
            <div className="separator">
              <span>or</span>
            </div>
            <button
              type="button"
              className="guest-btn"
              onClick={handleGuestLogin}
              disabled={loading || guestLoading}
            >
              {guestLoading ? "Logging in as Guest..." : "Login as Guest"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
