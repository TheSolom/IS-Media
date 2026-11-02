import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/authContext';
import { extractErrorMessage } from '../../utils/error';
import './login.scss';

const Login = () => {
    const [inputs, setInputs] = useState({
        emailOrUsername: '',
        password: '',
    });
    const [err, setErr] = useState(null);

    const navigate = useNavigate();

    const handleChange = (e) => {
        setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };
    const { login } = useContext(AuthContext);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await login(inputs);
            navigate('/');
        } catch (err) {
            setErr(extractErrorMessage(err, 'Failed to login'));
        }
    };

    return (
        <div className="login">
            <div className="card">
                <div className="left">
                    <h1>IS Media</h1>
                    <p>
                        Connect with friends and the world around you on IS
                        Media
                    </p>
                    <span>Don't you have an account?</span>
                    <Link to="/register">
                        <button>Register</button>
                    </Link>
                </div>
                <div className="right">
                    <h1>Login</h1>
                    <form>
                        <input
                            type="text"
                            placeholder="Email or Username"
                            name="emailOrUsername"
                            onChange={handleChange}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            name="password"
                            onChange={handleChange}
                        />
                        {err && (
                            <div
                                style={{
                                    color: 'red',
                                    fontWeight: 'bold',
                                    marginTop: '10px',
                                }}
                            >
                                {err}
                            </div>
                        )}
                        <button onClick={handleLogin}>Login</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
