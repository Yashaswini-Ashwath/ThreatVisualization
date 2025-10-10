import React, { useState } from 'react';
import Login from './components/Login.jsx';
import Dashboard from './components/Dashboard.jsx';
import { useInactivityLogout } from './hooks/useInactivityLogout.js';

function App() {
    const [token, setToken] = useState(localStorage.getItem('jwt'));

    const handleLogout = () => {
        localStorage.removeItem('jwt');
        setToken(null);
    };

    // Auto logout after 60 minutes of inactivity
    useInactivityLogout(token ? handleLogout : null);

    if (!token) {
        return <Login onLogin={setToken} />;
    }

    return <Dashboard onLogout={handleLogout} />;
}

export default App;