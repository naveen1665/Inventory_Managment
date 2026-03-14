import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { ShieldAlert, ShieldCheck, X } from 'lucide-react';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal state for edits
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [userToSuspend, setUserToSuspend] = useState(null);
    const [formData, setFormData] = useState({ username: '', password: '', role: 'manager', category: '' });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/users');
            setUsers(data);
        } catch (error) {
            toast.error('Failed to fetch personnel');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenSuspend = (user) => {
        if (user.role === 'admin') {
            toast.error('Cannot block another administrator.');
            return;
        }
        setUserToSuspend(user);
        setIsSuspendModalOpen(true);
    };

    const confirmBlockStatus = async () => {
        if (!userToSuspend) return;
        try {
            const { data } = await api.put(`/users/${userToSuspend._id}`, {
                isActive: !userToSuspend.isActive
            });
            setUsers(users.map(u => (u._id === data._id ? data : u)));
            toast.success(`User ${data.isActive ? 'unblocked' : 'blocked'} successfully`);
            handleCloseModal();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleOpenEdit = (user) => {
        setEditUser(user);
        setFormData({ username: user.username, role: user.role, category: user.category || '', password: '' });
        setIsEditModalOpen(true);
    };

    const handleOpenCreate = () => {
        setFormData({ username: '', password: '', role: 'manager', category: '' });
        setIsCreateModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsEditModalOpen(false);
        setIsCreateModalOpen(false);
        setIsSuspendModalOpen(false);
        setEditUser(null);
        setUserToSuspend(null);
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                role: formData.role,
            };

            if (formData.role === 'manager') {
                if (!formData.category) {
                    toast.warning("Managers must have a category");
                    return;
                }
                payload.category = formData.category;
            } else {
                payload.category = ''; // Clear category for admins
            }

            const { data } = await api.put(`/users/${editUser._id}`, payload);
            setUsers(users.map(u => (u._id === editUser._id ? data : u)));
            toast.success("Profile updated");
            handleCloseModal();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update user');
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/users', formData);
            setUsers([...users, data]);
            toast.success("User created successfully");
            handleCloseModal();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create user');
        }
    };

    return (
        <>
            <div className="animate-slide-up">
                <header className="page-header">
                <div>
                    <h2>Personnel Management</h2>
                    <p>Global view of all registered managers and admins. You can reassign categories or restrict access.</p>
                </div>
                <button className="btn btn-primary" onClick={handleOpenCreate}>
                    Register New User
                </button>
            </header>

            <div className="table-container">
                {loading ? (
                    <div className="loader-container">
                        <div className="spinner"></div>
                        <p>Loading identities...</p>
                    </div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Role</th>
                                <th>Category</th>
                                <th>Account Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u._id}>
                                    <td data-label="Username"><strong>{u.username}</strong></td>
                                    <td data-label="Role">
                                        <span className={u.role === 'admin' ? 'badge badge-admin' : 'badge badge-manager'}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td data-label="Category">{u.category ? u.category : 'N/A (Global)'}</td>
                                    <td data-label="Account Status">
                                        {u.isActive ? (
                                            <span className="badge badge-active"><ShieldCheck size={12} style={{ marginRight: 4, verticalAlign: 'text-top' }} /> Active</span>
                                        ) : (
                                            <span className="badge badge-blocked"><ShieldAlert size={12} style={{ marginRight: 4, verticalAlign: 'text-top' }} /> Blocked</span>
                                        )}
                                    </td>
                                    <td data-label="Actions">
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                            <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => handleOpenEdit(u)}>
                                                Edit Profile
                                            </button>
                                            {u.role !== 'admin' && (
                                                <button
                                                    className={u.isActive ? "btn btn-danger" : "btn btn-secondary"}
                                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                                    onClick={() => handleOpenSuspend(u)}
                                                >
                                                    {u.isActive ? 'Suspend Access' : 'Restore Access'}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Edit user <strong>{editUser?.username}</strong></h3>
                            <button style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }} onClick={handleCloseModal}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveEdit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="label">Force Role Change</label>
                                    <select className="input-field" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                                        <option value="manager">Manager</option>
                                        <option value="admin">Administrator (Elevated)</option>
                                    </select>
                                </div>

                                {formData.role !== 'admin' && (
                                    <div className="form-group">
                                        <label className="label">Reassign Category</label>
                                        <select
                                            className="input-field"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            required
                                        >
                                            <option value="" disabled>Select category</option>
                                            <option value="Fresh">Fresh</option>
                                            <option value="Scrap">Scrap</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Profile</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create User Modal */}
            {isCreateModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Register New User</h3>
                            <button style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }} onClick={handleCloseModal}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateUser}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="label">Username</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        required
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        placeholder="e.g. new_manager"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="label">Password</label>
                                    <input
                                        type="password"
                                        className="input-field"
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="••••••••"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="label">Role</label>
                                    <select className="input-field" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                                        <option value="manager">Manager</option>
                                        <option value="admin">Administrator (Elevated)</option>
                                    </select>
                                </div>

                                {formData.role !== 'admin' && (
                                    <div className="form-group">
                                        <label className="label">Assign Category</label>
                                        <select
                                            className="input-field"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            required
                                        >
                                            <option value="" disabled>Select category</option>
                                            <option value="Fresh">Fresh</option>
                                            <option value="Scrap">Scrap</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Register User</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Suspend Confirmation Modal */}
            {isSuspendModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h3>Confirm Action</h3>
                            <button style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }} onClick={handleCloseModal}>
                                <X size={24} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <p style={{ margin: 0 }}>
                                Are you sure you want to <strong>{userToSuspend?.isActive ? 'suspend' : 'restore'}</strong> access for <strong>{userToSuspend?.username}</strong>?
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button>
                            <button type="button" className={userToSuspend?.isActive ? "btn btn-danger" : "btn btn-primary"} onClick={confirmBlockStatus}>
                                {userToSuspend?.isActive ? 'Suspend Access' : 'Restore Access'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Users;
