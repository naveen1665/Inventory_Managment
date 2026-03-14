import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Users, LogOut, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const location = useLocation();
    const { user, logout } = useAuth();

    const menuItems = [
        { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
        { name: 'Equipment', path: '/equipment', icon: <Package size={20} /> },
    ];

    if (user?.role === 'admin') {
        menuItems.push({ name: 'Manage Users', path: '/users', icon: <Users size={20} /> });
    }

    return (
        <>
            <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={toggleSidebar}></div>
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-brand">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div className="sidebar-logo"><Package color="#fff" /></div>
                        <h2 style={{ fontSize: '1.25rem', letterSpacing: '0.5px' }}>Inventry</h2>
                    </div>
                    {isOpen && (
                        <button style={{ background: 'transparent', border: 'none', color: 'var(--text-main)' }} onClick={toggleSidebar}>
                            <X size={24} />
                        </button>
                    )}
                </div>

                <div className="sidebar-user">
                    <div className="sidebar-avatar">{user?.username?.charAt(0).toUpperCase()}</div>
                    <div>
                        <h4 style={{ margin: 0 }}>{user?.username}</h4>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <span className={user?.role === 'admin' ? 'badge badge-admin' : 'badge badge-manager'}>
                                {user?.role}
                            </span>
                            <br />
                            {user?.category && <span style={{ display: 'inline-block', marginTop: '4px' }}>Category: {user.category}</span>}
                        </p>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
                            onClick={() => { if (isOpen) toggleSidebar(); }}
                        >
                            {item.icon}
                            <span>{item.name}</span>
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={logout}>
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
