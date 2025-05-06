import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('https://localhost:7177/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: usernameOrEmail, email: usernameOrEmail, password }),
            });

            if (!response.ok) {
                setErrorMessage('Invalid credentials');
                return;
            }

            const data = await response.json();
            localStorage.setItem('accessToken', data.accessToken);
            navigate('/');
        } catch (error) {
            console.error('Login error:', error);
            setErrorMessage('An error occurred. Please try again later.');
        }
    };

    return (
        <div className="container mt-5">
            <h2 className="text-center">Login</h2>

            <form onSubmit={handleLogin}>
                <div className="mb-3">
                    <label htmlFor="usernameOrEmail" className="form-label">Username or Email</label>
                    <input
                        type="text"
                        id="usernameOrEmail"
                        className="form-control"
                        value={usernameOrEmail}
                        onChange={(e) => setUsernameOrEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                        type="password"
                        id="password"
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

                <button type="submit" className="btn btn-primary">Login</button>
            </form>

            <div className="mt-3">
                <p>Don't have an account? <Link to="/register">Sign up here</Link></p>
            </div>
        </div>
    );
};

export default Login;
