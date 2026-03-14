import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Package, Server, CheckCircle, Archive } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalItems: 0,
        totalQuantity: 0,
        freshUnits: 0,
        scrapUnits: 0
    });

    useEffect(() => {
        const fetchEquipment = async () => {
            try {
                const { data } = await api.get('/equipment');
                const totalQty = data.reduce((acc, item) => acc + item.quantity, 0);
                const freshQty = data.filter(item => item.category === 'Fresh').reduce((acc, item) => acc + item.quantity, 0);
                const scrapQty = data.filter(item => item.category === 'Scrap').reduce((acc, item) => acc + item.quantity, 0);

                setStats({
                    totalItems: data.length,
                    totalQuantity: totalQty,
                    freshUnits: freshQty,
                    scrapUnits: scrapQty
                });
            } catch (error) {
                console.error("Failed to load dashboard stats", error);
            }
        };
        fetchEquipment();
    }, []);

    const statCards = [
        { title: 'Total Equipment Records', value: stats.totalItems, icon: <Package size={24} color="#6366f1" />, glow: "rgba(99,102,241,0.15)" },
        { title: 'Total Units in Stock', value: stats.totalQuantity, icon: <Server size={24} color="#10b981" />, glow: "rgba(16,185,129,0.15)" },
        { title: 'Fresh Units Stock', value: stats.freshUnits, icon: <CheckCircle size={24} color="#3b82f6" />, glow: "rgba(59,130,246,0.15)" },
        { title: 'Scrap Units Stock', value: stats.scrapUnits, icon: <Archive size={24} color="#f43f5e" />, glow: "rgba(244,63,94,0.15)" },
    ];

    return (
        <div className="animate-slide-up">
            <header className="page-header">
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, background: 'linear-gradient(to right, #fff, var(--text-muted))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Welcome back, {user?.username}
                    </h1>
                    <p style={{ margin: 0, marginTop: '0.5rem', color: 'var(--text-muted)' }}>Here's what is happening with your {(user?.role === 'admin' ? 'global' : 'category')} inventory today.</p>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                {statCards.map((stat, i) => (
                    <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: `radial-gradient(circle at top right, ${stat.glow}, transparent 60%), var(--bg-glass)` }}>
                        <div style={{ background: 'rgba(0,0,0,0.3)', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {stat.icon}
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>{stat.title}</p>
                            <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="card" style={{ padding: '2rem' }}>
                <h3>Quick Actions</h3>
                <p style={{ marginBottom: '1.5rem' }}>Manage your inventory rapidly from the dashboard.</p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <a href="/equipment" className="btn btn-primary">Go to Equipment Database</a>
                    {user?.role === 'admin' && (
                        <a href="/users" className="btn btn-secondary">Manage Personnel</a>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
