import React, { useState, useCallback } from 'react';
import './Login.css';
import cybersecurityBg from '../assets/cybersecurity-bg.jpg';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export const LOGIN_URL = `${API_BASE}/login`;


function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                throw new Error('Invalid credentials');
            }

            const data = await response.json();
            
            if (data.token) {
                localStorage.setItem('jwt', data.token);
                onLogin(data.token);
            } else {
                setError('Login failed. Please try again.');
            }
        } catch (err) {
            setError(err.message === 'Invalid credentials' 
                ? 'Invalid username or password' 
                : 'Network error. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    }, [username, password, onLogin]);

    return (
        <div 
            className="login-container" 
            style={{ 
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${cybersecurityBg})`
            }}
        >
            <div className="login-box">
                <h1>Threat Visualization</h1>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                            autoComplete="username"
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                        />
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;