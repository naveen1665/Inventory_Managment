import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Plus, Edit2, Trash2, X, Search, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

const Equipment = () => {
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [filterCategory, setFilterCategory] = useState('All');
    const { user } = useAuth();
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [formData, setFormData] = useState({ name: '', category: '', quantity: 0 });

    useEffect(() => {
        fetchEquipment();
    }, []);

    const fetchEquipment = async () => {
        try {
            const { data } = await api.get('/equipment');
            setEquipment(data);
        } catch (error) {
            toast.error('Failed to load equipment');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (item) => {
        setItemToDelete(item);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await api.delete(`/equipment/${itemToDelete._id}`);
            setEquipment(equipment.filter(e => e._id !== itemToDelete._id));
            toast.success('Equipment deleted');
            handleCloseModal();
        } catch (error) {
            toast.error('Failed to delete equipment');
        }
    };

    const handleOpenModal = (equip = null) => {
        if (equip) {
            setEditId(equip._id);
            setFormData({
                name: equip.name,
                category: equip.category,
                quantity: equip.quantity
            });
        } else {
            setEditId(null);
            setFormData({ name: '', category: user.role === 'admin' ? '' : user.category, quantity: 0 });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsDeleteModalOpen(false);
        setEditId(null);
        setItemToDelete(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                const { data } = await api.put(`/equipment/${editId}`, formData);
                setEquipment(equipment.map(eq => eq._id === editId ? data : eq));
                toast.success('Equipment updated');
            } else {
                const { data } = await api.post('/equipment', formData);
                setEquipment([...equipment, data]);
                toast.success('Equipment created');
            }
            handleCloseModal();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const processedEquipment = [...equipment].filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
        return matchesSearch && matchesCategory;
    }).sort((a, b) => {
        if (sortBy === 'category') return a.category.localeCompare(b.category);
        if (sortBy === 'quantity') return b.quantity - a.quantity;
        return a.name.localeCompare(b.name);
    });

    const exportToExcel = () => {
        if (processedEquipment.length === 0) {
            toast.warning('No data to export');
            return;
        }

        const exportData = processedEquipment.map(item => ({
            'Item Name': item.name,
            'Category': item.category,
            'Quantity': item.quantity
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Equipment");
        
        XLSX.writeFile(workbook, "Inventory_Equipment.xlsx");
        toast.success('Successfully exported to Excel');
    };

    return (
        <>
            <div className="animate-slide-up">
                <div className="page-header" style={{ marginBottom: '1.5rem' }}>
                <div>
                    <h2>Equipment Directory</h2>
                    <p>Manage your {(user?.role === 'admin' ? 'global' : 'category')} inventory.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-secondary" onClick={exportToExcel}>
                        <Download size={18} /> Export Excel
                    </button>
                    <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                        <Plus size={18} /> Add Equipment
                    </button>
                </div>
            </div>

            <div className="search-filter-container">
                <div className="search-input-wrapper">
                    <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                        type="text" 
                        className="input-field" 
                        placeholder="Search equipment..." 
                        style={{ paddingLeft: '2.5rem' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>Category:</label>
                        <select className="input-field" style={{ width: 'auto' }} value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                            <option value="All">All Types</option>
                            <option value="Fresh">Fresh</option>
                            <option value="Scrap">Scrap</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>Sort By:</label>
                        <select className="input-field" style={{ width: 'auto' }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option value="name">Name (A-Z)</option>
                            <option value="quantity">Quantity (High-Low)</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="table-container">
                {loading ? (
                    <div className="loader-container">
                        <div className="spinner"></div>
                        <p>Loading equipment directory...</p>
                    </div>
                ) : equipment.length === 0 ? (
                    <p style={{ padding: '2rem', textAlign: 'center' }}>No equipment found in {user?.role === 'manager' ? 'your category.' : 'the system.'}</p>
                ) : processedEquipment.length === 0 ? (
                    <p style={{ padding: '2rem', textAlign: 'center' }}>No equipment matches your search criteria.</p>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Item Name</th>
                                <th>Category</th>
                                <th>Quantity</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {processedEquipment.map(item => (
                                <tr key={item._id}>
                                    <td data-label="Item Name"><strong>{item.name}</strong></td>
                                    <td data-label="Category"><span className="badge badge-manager">{item.category}</span></td>
                                    <td data-label="Quantity">{item.quantity}</td>
                                    <td data-label="Actions">
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                            <button className="btn btn-secondary" style={{ padding: '0.5rem' }} onClick={() => handleOpenModal(item)}>
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="btn btn-danger" style={{ padding: '0.5rem' }} onClick={() => handleDeleteClick(item)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{editId ? 'Edit Equipment' : 'Add New Equipment'}</h3>
                            <button style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }} onClick={handleCloseModal}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="label">Equipment Name</label>
                                    <input type="text" className="input-field" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                                </div>

                                {user?.role === 'admin' ? (
                                    <div className="form-group">
                                        <label className="label">Category</label>
                                        <select className="input-field" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required>
                                            <option value="" disabled>Select category</option>
                                            <option value="Fresh">Fresh</option>
                                            <option value="Scrap">Scrap</option>
                                        </select>
                                    </div>
                                ) : (
                                    <div className="form-group">
                                        <label className="label">Assigned Category</label>
                                        <input type="text" className="input-field" value={user?.category} disabled />
                                        <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--accent-warning)' }}>Managers can only register items to their assigned category.</p>
                                    </div>
                                )}

                                <div className="form-group">
                                    <label className="label">Quantity</label>
                                    <input type="number" min="0" className="input-field" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })} required />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button>
                                <button type="submit" className="btn btn-primary">
                                    {editId ? 'Save Changes' : 'Create Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h3>Confirm Deletion</h3>
                            <button style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }} onClick={handleCloseModal}>
                                <X size={24} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <p style={{ margin: 0 }}>
                                Are you sure you want to permanently delete <strong>{itemToDelete?.name}</strong> from inventory?
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button>
                            <button type="button" className="btn btn-danger" onClick={confirmDelete}>
                                Delete Equipment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Equipment;
