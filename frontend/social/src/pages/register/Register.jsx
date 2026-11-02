import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { extractFormErrors } from '../../utils/error';
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
    const [errors, setErrors] = useState({ general: null, fields: {} });
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

    const handleClick = async (e) => {
        e.preventDefault();
        setErrors({ general: null, fields: {} });

        try {
            await axios.post(
                'http://localhost:5000/api/v1/auth/signup',
                inputs,
            );
            navigate('/login');
            alert('Registered successfully');
        } catch (err) {
            setErrors(extractFormErrors(err, 'Failed to register'));
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
                    <form onSubmit={handleClick}>
                        {errors.general && (
                            <div className="form-error-alert">
                                {errors.general}
                            </div>
                        )}
                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="First Name"
                                name="firstname"
                                value={inputs.firstname}
                                onChange={handleChange}
                            />
                            {errors.fields.firstname && (
                                <span className="field-error">
                                    {errors.fields.firstname}
                                </span>
                            )}
                        </div>
                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="Last Name"
                                name="lastname"
                                value={inputs.lastname}
                                onChange={handleChange}
                            />
                            {errors.fields.lastname && (
                                <span className="field-error">
                                    {errors.fields.lastname}
                                </span>
                            )}
                        </div>
                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="Username"
                                name="username"
                                value={inputs.username}
                                onChange={handleChange}
                            />
                            {errors.fields.username && (
                                <span className="field-error">
                                    {errors.fields.username}
                                </span>
                            )}
                        </div>
                        <div className="input-group">
                            <input
                                type="email"
                                placeholder="Email"
                                name="email"
                                value={inputs.email}
                                onChange={handleChange}
                            />
                            {errors.fields.email && (
                                <span className="field-error">
                                    {errors.fields.email}
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
                                <span className="field-error">
                                    {errors.fields.password}
                                </span>
                            )}
                        </div>
                        <div className="input-group">
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                name="confirmPassword"
                                value={inputs.confirmPassword}
                                onChange={handleChange}
                            />
                            {errors.fields.confirmPassword && (
                                <span className="field-error">
                                    {errors.fields.confirmPassword}
                                </span>
                            )}
                        </div>
                        <div className="input-group">
                            <label>
                                Birth date :
                                <input
                                    type="text"
                                    placeholder="yyyy-mm-dd"
                                    name="birthDate"
                                    value={inputs.birthDate}
                                    onChange={handleChange}
                                />
                            </label>
                            {errors.fields.birthDate && (
                                <span className="field-error">
                                    {errors.fields.birthDate}
                                </span>
                            )}
                        </div>
                        <div className="input-group">
                            <label>
                                Gender :
                                <select
                                    name="gender"
                                    value={inputs.gender}
                                    onChange={handleChange}
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </label>
                            {errors.fields.gender && (
                                <span className="field-error">
                                    {errors.fields.gender}
                                </span>
                            )}
                        </div>
                        <button type="submit">Register</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
