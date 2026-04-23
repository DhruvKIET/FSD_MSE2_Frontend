import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [items, setItems] = useState([]);
    const [itemName, setItemName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('Lost');
    const [location, setLocation] = useState('');
    const [date, setDate] = useState('');
    const [contactInfo, setContactInfo] = useState('');
    const [search, setSearch] = useState('');
    const [searchType, setSearchType] = useState('');
    const [editId, setEditId] = useState(null);
    const [userInfo, setUserInfo] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const info = localStorage.getItem('userInfo');
        if (info) {
            setUserInfo(JSON.parse(info));
        }
    }, []);

    const fetchItems = async () => {
        try {
            const { data } = await axios.get('http://127.0.0.1:5000/api/items');
            setItems(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleSearch = async (nameVal, typeVal) => {
        if (nameVal === '' && typeVal === '') {
            fetchItems();
            return;
        }
        try {
            const { data } = await axios.get(`http://127.0.0.1:5000/api/items/search?name=${nameVal}&type=${typeVal}`);
            setItems(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userInfo) {
            navigate('/login');
            return;
        }
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const itemData = { itemName, description, type, location, date, contactInfo };

        try {
            if (editId) {
                await axios.put(`http://127.0.0.1:5000/api/items/${editId}`, itemData, config);
                setEditId(null);
            } else {
                await axios.post('http://127.0.0.1:5000/api/items', itemData, config);
            }
            setItemName('');
            setDescription('');
            setType('Lost');
            setLocation('');
            setDate('');
            setContactInfo('');
            fetchItems();
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = (item) => {
        setEditId(item._id);
        setItemName(item.itemName);
        setDescription(item.description);
        setType(item.type);
        setLocation(item.location);
        setDate(item.date.split('T')[0]);
        setContactInfo(item.contactInfo);
        window.scrollTo(0, 0);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                await axios.delete(`http://127.0.0.1:5000/api/items/${id}`, config);
                fetchItems();
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        setUserInfo(null);
        navigate('/login');
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Lost & Found Dashboard</h2>
                <div>
                    {userInfo ? (
                        <>
                            <span className="me-3">Welcome, {userInfo.name}</span>
                            <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
                        </>
                    ) : (
                        <button className="btn btn-primary" onClick={() => navigate('/login')}>Login to Post Items</button>
                    )}
                </div>
            </div>

            {userInfo && (
                <div className="card mb-4">
                    <div className="card-header"><h4>{editId ? 'Edit Item' : 'Add New Item'}</h4></div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit} className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label">Item Name</label>
                                <input type="text" title="itemName" className="form-control" value={itemName} onChange={(e) => setItemName(e.target.value)} required />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Type</label>
                                <select className="form-select" title="type" value={type} onChange={(e) => setType(e.target.value)}>
                                    <option value="Lost">Lost</option>
                                    <option value="Found">Found</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Date</label>
                                <input type="date" title="date" className="form-control" value={date} onChange={(e) => setDate(e.target.value)} required />
                            </div>
                            <div className="col-md-12">
                                <label className="form-label">Description</label>
                                <textarea className="form-control" title="description" value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Location</label>
                                <input type="text" title="location" className="form-control" value={location} onChange={(e) => setLocation(e.target.value)} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Contact Info</label>
                                <input type="text" title="contactInfo" className="form-control" value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} required />
                            </div>
                            <div className="col-12">
                                <button type="submit" className="btn btn-primary">{editId ? 'Update Item' : 'Add Item'}</button>
                                {editId && <button type="button" className="btn btn-secondary ms-2" onClick={() => {setEditId(null); setItemName(''); setDescription(''); setType('Lost'); setLocation(''); setDate(''); setContactInfo('');}}>Cancel</button>}
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="row mb-3">
                <div className="col-md-8">
                    <input type="text" title="searchName" className="form-control" placeholder="Search items by name..." value={search} onChange={(e) => {setSearch(e.target.value); handleSearch(e.target.value, searchType);}} />
                </div>
                <div className="col-md-4">
                    <select className="form-select" title="searchType" value={searchType} onChange={(e) => {setSearchType(e.target.value); handleSearch(search, e.target.value);}}>
                        <option value="">All Categories</option>
                        <option value="Lost">Lost</option>
                        <option value="Found">Found</option>
                    </select>
                </div>
            </div>

            <h4>All Reported Items</h4>
            <div className="row">
                {items.length === 0 ? (
                    <div className="col-12 text-center">
                        <p>No items found.</p>
                    </div>
                ) : items.map((item) => (
                    <div className="col-md-4 mb-3" key={item._id}>
                        <div className={`card ${item.type === 'Lost' ? 'border-danger' : 'border-success'}`}>
                            <div className="card-body">
                                <h5 className="card-title">{item.itemName} <span className={`badge ${item.type === 'Lost' ? 'bg-danger' : 'bg-success'}`}>{item.type}</span></h5>
                                <p className="card-text">{item.description}</p>
                                <p className="card-text"><small className="text-muted">Location: {item.location}</small></p>
                                <p className="card-text"><small className="text-muted">Date: {item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}</small></p>
                                <p className="card-text"><small className="text-muted">Posted by: {item.user ? item.user.name : 'Unknown'}</small></p>
                                {userInfo?._id === item.user?._id && (
                                    <div className="d-flex justify-content-between">
                                        <button className="btn btn-sm btn-warning" onClick={() => handleEdit(item)}>Edit</button>
                                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item._id)}>Delete</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
