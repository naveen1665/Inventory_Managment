import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Package } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(username, password);
        if (success) {
            navigate('/');
        }
    };

    return (
        <div className="login-split-layout">
            <div className="login-form-area">
                <div className="glass-panel login-card">
                    <div className="login-header">
                        <div className="logo-large"><Package color="#fff" size={32} /></div>
                        <h2>Warehouse Portal</h2>
                        <p>Authenticate to manage inventory</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="label">Secure ID / Username</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="label">Password</label>
                            <input
                                type="password"
                                className="input-field"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '1rem', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Login
                        </button>
                    </form>
                </div>
            </div>
            <div className="login-image-area">
                <div className="login-overlay-text">
                    <h1>Automated.<br/>Intelligent.<br/>Inventory.</h1>
                    <p>Next-generation warehouse management system.</p>
                </div>
            </div>
        </div>
    );
};
export default Login;
