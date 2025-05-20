import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../css/SponsorChild.css'; 
import { useAuth } from '../components/AuthContext'; // Update this path to match your project structure

const SponsorChild = () => {
    const [children, setChildren] = useState([]);
    const [newChild, setNewChild] = useState({
        name: '',
        age: '',
        description: '',
        amount: '',
        image: null
    });
    const [editingChild, setEditingChild] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [loading, setLoading] = useState(true);
    const { isAdmin } = useAuth(); // Get the isAdmin status from auth context

    useEffect(() => {
        fetchChildren();
    }, []);

    const fetchChildren = () => {
        setLoading(true);
        axios.get('http://localhost:3001/children')
            .then(result => {
                console.log("Data received:", result.data);
                setChildren(result.data);
                setLoading(false);
            })
            .catch(err => {
                console.log(err);
                setLoading(false);
            });
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this profile?')) {
            axios.delete(`http://localhost:3001/children/${id}`)
                .then(res => {
                    console.log(res);
                    fetchChildren();
                })
                .catch(err => console.log(err));
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (isEditing) {
            setEditingChild({ ...editingChild, [name]: value });
        } else {
            setNewChild({ ...newChild, [name]: value });
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Create a preview URL for the selected image
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
            
            // Set the file in state
            if (isEditing) {
                setEditingChild({ ...editingChild, image: file });
            } else {
                setNewChild({ ...newChild, image: file });
            }
        }
    };

    const handleAdd = (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('name', newChild.name);
        formData.append('age', newChild.age);
        formData.append('description', newChild.description);
        formData.append('amount', newChild.amount);
        if (newChild.image) {
            formData.append('image', newChild.image);
        }

        axios.post('http://localhost:3001/children', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
            .then(res => {
                console.log(res);
                setNewChild({
                    name: '',
                    age: '',
                    description: '',
                    amount: '',
                    image: null
                });
                setPreviewImage('');
                setIsAdding(false);
                fetchChildren();
            })
            .catch(err => console.log(err));
    };

    const startEdit = (child) => {
        setEditingChild(child);
        setIsEditing(true);
        if (child.imagePath) {
            setPreviewImage(`http://localhost:3001/uploads/${child.imagePath}`);
        } else {
            setPreviewImage('');
        }
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('name', editingChild.name);
        formData.append('age', editingChild.age);
        formData.append('description', editingChild.description);
        formData.append('amount', editingChild.amount);
        if (editingChild.image && typeof editingChild.image !== 'string') {
            formData.append('image', editingChild.image);
        }

        axios.put(`http://localhost:3001/children/${editingChild._id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
            .then(res => {
                console.log(res);
                setEditingChild(null);
                setPreviewImage('');
                setIsEditing(false);
                fetchChildren();
            })
            .catch(err => console.log(err));
    };

    const cancelEdit = () => {
        setEditingChild(null);
        setIsEditing(false);
        setPreviewImage('');
    };

    const cancelAdd = () => {
        setNewChild({
            name: '',
            age: '',
            description: '',
            amount: '',
            image: null
        });
        setPreviewImage('');
        setIsAdding(false);
    };

    return (
        <div className="home-container">
           
            <div className="hero-section" style={{ height: '50vh' }}>
                <div className="hero-content">
                    <h1>Sponsor a Child</h1>
                    <p>Make a lasting difference in a child's life through our sponsorship program</p>
                </div>
            </div>
            
            <div className="sponsor-container">
                <div className="sponsor-card">
                    <div className="sponsor-card-header">
                        <h3 className="sponsor-title">Children Profiles</h3>
                        {/* Only show the Add Child button if user is admin */}
                        {!isAdding && !isEditing && isAdmin && (
                            <button className="btn-add" onClick={() => setIsAdding(true)}>
                                Add Child
                            </button>
                        )}
                    </div>
                    <div className="sponsor-card-body">
                        {isAdding && (
                            <div className="form-container">
                                <h4 className="form-title">Add New Child Profile</h4>
                                <form onSubmit={handleAdd}>
                                    <div className="form-row">
                                        <div className="form-column">
                                            <div className="form-group">
                                                <label className="form-label">Name</label>
                                                <input 
                                                    type="text" 
                                                    className="form-input" 
                                                    name="name" 
                                                    value={newChild.name} 
                                                    onChange={handleInputChange} 
                                                    required 
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Age</label>
                                                <input 
                                                    type="number" 
                                                    className="form-input" 
                                                    name="age" 
                                                    value={newChild.age} 
                                                    onChange={handleInputChange} 
                                                    required 
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Sponsorship Amount ($)</label>
                                                <input 
                                                    type="number" 
                                                    className="form-input" 
                                                    name="amount" 
                                                    value={newChild.amount} 
                                                    onChange={handleInputChange} 
                                                    required 
                                                />
                                            </div>
                                        </div>
                                        <div className="form-column">
                                            <div className="form-group">
                                                <label className="form-label">Description</label>
                                                <textarea 
                                                    className="form-textarea" 
                                                    name="description" 
                                                    value={newChild.description} 
                                                    onChange={handleInputChange} 
                                                    rows="3"
                                                    placeholder="Interests, hobbies, special notes..."
                                                    required
                                                ></textarea>
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Photo</label>
                                                <input 
                                                    type="file" 
                                                    className="form-file" 
                                                    onChange={handleImageChange} 
                                                    accept="image/*"
                                                    required
                                                />
                                            </div>
                                            {previewImage && (
                                                <div className="preview-container">
                                                    <img 
                                                        src={previewImage} 
                                                        alt="Preview" 
                                                        className="preview-image" 
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="form-actions">
                                        <button type="button" className="btn-cancel" onClick={cancelAdd}>
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn-save">
                                            Save Profile
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {isEditing && editingChild && (
                            <div className="form-container">
                                <h4 className="form-title">Edit Child Profile</h4>
                                <form onSubmit={handleUpdate}>
                                    <div className="form-row">
                                        <div className="form-column">
                                            <div className="form-group">
                                                <label className="form-label">Name</label>
                                                <input 
                                                    type="text" 
                                                    className="form-input" 
                                                    name="name" 
                                                    value={editingChild.name} 
                                                    onChange={handleInputChange} 
                                                    required 
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Age</label>
                                                <input 
                                                    type="number" 
                                                    className="form-input" 
                                                    name="age" 
                                                    value={editingChild.age} 
                                                    onChange={handleInputChange} 
                                                    required 
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Donate Amount ($)</label>
                                                <input 
                                                    type="number" 
                                                    className="form-input" 
                                                    name="amount" 
                                                    value={editingChild.amount || ''} 
                                                    onChange={handleInputChange} 
                                                    required 
                                                />
                                            </div>
                                        </div>
                                        <div className="form-column">
                                            <div className="form-group">
                                                <label className="form-label">Description</label>
                                                <textarea 
                                                    className="form-textarea" 
                                                    name="description" 
                                                    value={editingChild.description || ''} 
                                                    onChange={handleInputChange} 
                                                    rows="3"
                                                    placeholder="Reason for collecting the fund amount"
                                                    required
                                                ></textarea>
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Photo</label>
                                                <input 
                                                    type="file" 
                                                    className="form-file" 
                                                    onChange={handleImageChange} 
                                                    accept="image/*"
                                                />
                                                <small className="text-hint">Leave empty to keep current photo</small>
                                            </div>
                                            {previewImage && (
                                                <div className="preview-container">
                                                    <img 
                                                        src={previewImage} 
                                                        alt="Preview" 
                                                        className="preview-image" 
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="form-actions">
                                        <button type="button" className="btn-cancel" onClick={cancelEdit}>
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn-update">
                                            Update Profile
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {!isAdding && !isEditing && (
                            <>
                                {loading ? (
                                    <div className="loading-container">
                                        <p>Loading children profiles...</p>
                                    </div>
                                ) : (
                                    <div className="children-grid">
                                        {children.length > 0 ? (
                                            children.map((child) => (
                                                <div key={child._id} className="child-card">
                                                    <div className="child-image-container">
                                                        {child.imagePath ? (
                                                            <img 
                                                                src={`http://localhost:3001/uploads/${child.imagePath}`} 
                                                                alt={child.name} 
                                                                className="child-image" 
                                                            />
                                                        ) : (
                                                            <div className="child-no-image">
                                                                <span>No image</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="child-content">
                                                        <h5 className="child-name">{child.name}</h5>
                                                        <p className="child-age">Age: {child.age}</p>
                                                        <p className="child-description">{child.description}</p>
                                                    </div>
                                                    <div className="child-sponsor">
                                                        <button className="btn-sponsor">
                                                            Donate ${child.amount || '0'}
                                                        </button>
                                                    </div>
                                                    {/* Only show edit and delete buttons if user is admin */}
                                                    {isAdmin && (
                                                        <div className="child-actions">
                                                            <button 
                                                                className="btn-edit" 
                                                                onClick={() => startEdit(child)}
                                                            >
                                                                Edit
                                                            </button>
                                                            <button 
                                                                className="btn-delete" 
                                                                onClick={() => handleDelete(child._id)}
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="no-children">
                                                <p>No children profiles found. {isAdmin && 'Click "Add Child" to create one!'}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
            
            <section className="cta-section">
                <div className="section-container">
                    <h2>Make a Difference Today</h2>
                    <p>Your support can transform a child's life through education, healthcare, and loving care.</p>
                    <div className="cta-buttons">
                        <Link to="/contribute/provisions" className="btn primary-btn">Donate Now</Link>
                        <Link to="/contact" className="btn secondary-btn">Get Involved</Link>
                    </div>
                </div>
            </section>
            
        </div>
    );
}

export default SponsorChild;