import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const { user, loading } = useAuth();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    if (loading) return <div>Loading...</div>;

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (user.isActive === false) {
        return <Navigate to="/login" replace />;
    }

    if (requireAdmin && user.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="app-container">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <main className="main-content" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="mobile-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                            width: '32px', height: '32px',
                            borderRadius: '8px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)'
                        }}>
                            <Menu color="#fff" size={16} style={{ display: 'none' }} />
                            <span style={{ fontWeight: 'bold', fontSize: '1rem', color: '#fff' }}>I</span>
                        </div>
                        <h2 style={{ fontSize: '1.25rem', margin: 0, letterSpacing: '0.5px' }}>Inventry</h2>
                    </div>
                    <button 
                        className="mobile-nav-toggle" 
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Menu size={24} />
                    </button>
                </div>
                <div className="content-wrapper">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default ProtectedRoute;
