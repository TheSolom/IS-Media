import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { extractErrorMessage } from '../../utils/error';
import './register.scss';

const Register = () => {
    const [inputs, setInputs] = useState({
        firstname: '',
        lastname: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        birthDate: '',
        gender: 'male',
    });
    const [err, setErr] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleClick = async (e) => {
        e.preventDefault();

        try {
            await axios.post(
                'http://localhost:5000/api/v1/auth/signup',
                inputs,
            );
            navigate('/login');
            alert('Registered successfully');
        } catch (err) {
            setErr(extractErrorMessage(err, 'Failed to register'));
        }
    };

    return (
        <div className="register">
            <div className="card">
                <div className="left">
                    <h1>IS Media.</h1>
                    <p>
                        Connect with friends and the world around you on IS
                        Media
                    </p>
                    <span>Do you have an account?</span>
                    <Link to="/login">
                        <button>Login</button>
                    </Link>
                </div>
                <div className="right">
                    <h1>Register</h1>
                    <form>
                        <input
                            type="text"
                            placeholder="firstname"
                            name="firstname"
                            onChange={handleChange}
                        />
                        <input
                            type="text"
                            placeholder="lastname"
                            name="lastname"
                            onChange={handleChange}
                        />
                        <input
                            type="text"
                            placeholder="Username"
                            name="username"
                            onChange={handleChange}
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            name="email"
                            onChange={handleChange}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            name="password"
                            onChange={handleChange}
                        />
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            name="confirmPassword"
                            onChange={handleChange}
                        />
                        <label>
                            Birth date :
                            <input
                                type="text"
                                placeholder="yyyy-mm-dd"
                                name="birthDate"
                                onChange={handleChange}
                            />
                        </label>
                        <label>
                            Gender :
                            <select name="gender" value={inputs.gender} onChange={handleChange}>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </label>
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
                        <button onClick={handleClick}>Register</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
