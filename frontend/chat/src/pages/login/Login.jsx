import { useState } from 'react';
import useLogin from '../../hooks/useLogin';

const Login = () => {
    const [emailOrUsername, setEmailOrUsername] = useState('');
    const [password, setPassword] = useState('');

    const { loading, login } = useLogin();

    const handleSubmit = async (e) => {
        e.preventDefault();
        await login(emailOrUsername, password);
    };

    return (
        <div className="flex flex-col items-center justify-center min-w-96 mx-auto">
            <div className="w-full p-6 rounded-lg shadow-md bg-blue-700 bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-50">
                <h1 className="text-3xl font-semibold text-center text-white ">
                    Login
                    <span className="font-extrabold text-transparent text-3xl bg-clip-text bg-gradient-to-b from-cyan-800 to-blue-800">
                        {' '}
                        IS chat{' '}
                    </span>
                    <img
                        src="chat.png"
                        alt="logo"
                        className="w-10 h-10 inline"
                    />
                </h1>

                <form onSubmit={handleSubmit}>
                    <div>
                        <label className="label p-2">
                            <span className="text-base label-text text-white mt-4">
                                Email or Username
                            </span>
                        </label>
                        <input
                            type="text"
                            placeholder="Enter email or username"
                            className="w-full input input-bordered h-10"
                            value={emailOrUsername}
                            onChange={(e) => setEmailOrUsername(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="label">
                            <span className="text-base label-text text-white">
                                Password
                            </span>
                        </label>
                        <input
                            type="password"
                            placeholder="Enter Password"
                            className="w-full input input-bordered h-10"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <a
                        href="http://localhost:3000/login"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm hover:underline hover:text-blue-600 mt-6 mb-1 inline-block text-blue-900"
                    >
                        {"Don't"} have an IS Media account?
                    </a>

                    <div>
                        <button
                            className="btn btn-block btn-sm mt-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="loading loading-spinner"></span>
                            ) : (
                                'Login'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
